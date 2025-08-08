import api from "@/api/api";
import store from "@/store";
import moment from "moment";

export default class IdentityService {
  static async fetchIdentityFromURL(url) {
    return api().get(url);
  }

  static async fetchPopulatedIdentityV1(id) {
    return api().get(`/api/v1/cloaked/identity/${id}/?summary=true`);
  }

  static async fetchPopulatedIdentityV2(id) {
    return api().get(`/api/v2/cloaked/identity/${id}/?summary=true`);
  }
  static async fetchTwillioIdentitiesPageV2(page, resultsPerPage = 10) {
    return api().get(
      `/api/v2/cloaked/identity/?phone_provider=twilio&summary=true&page_size=${resultsPerPage}&page=${page}`
    );
  }

  static async fetchBandwidthIdentitiesPageV2(page, resultsPerPage = 10) {
    return api().get(
      `/api/v2/cloaked/identity/?phone_provider=bandwidth&summary=true&page_size=${resultsPerPage}&page=${page}`
    );
  }

  static async fetchIdentities(
    url = "/api/v2/cloaked/identity/?page_size=5000"
  ) {
    return api().get(url);
  }

  static async fetchIdentitiesWithNextUrl(url) {
    return api().get(url);
  }

  static async patchAutofill(id, payload) {
    return api()
      .patch(`/api/v1/cloaked/identity/${id}/autofill/`, payload)
      .then(({ data }) => {
        store.commit("insertAutofill", data);
        return data;
      });
  }

  static async createAutofill(data) {
    const url = `/api/v1/cloaked/autofill/`;
    let payload = {};
    payload["type"] = "personal";
    payload["user"] = store.state.authentication?.user?.url;
    payload["collection"] =
      store.getters["authentication/collection"]("autofill");
    payload["collection_name"] = "autofill";
    payload = Object.assign({}, payload, data);
    return await api()
      .post(url, payload)
      .then((updated) => {
        store.commit("insertAutofill", updated.data);
        return updated;
      });
  }

  static async patchCustomField(id, payload) {
    return api(undefined, {
      "content-type": "application/json-patch+json",
    }).patch(`/api/v1/cloaked/identity/${id}/custom_field/`, payload);
  }

  static async createSharing(id, payload) {
    return api().post(`/api/v1/cloaked/identity/${id}/share/`, payload);
  }

  static async patchSharing(id, payload) {
    return api().patch(`/api/v1/cloaked/identity/${id}/share/`, payload);
  }

  static async deleteSharing(id) {
    return api().delete(`/api/v1/cloaked/identity/${id}/share/`);
  }

  static async generateNewSharingLink(id) {
    return api().post(`/api/v1/cloaked/identity/${id}/share/new-url/`);
  }

  static async generateCloakedPhoneForIdentity(id) {
    return api().post(`/api/v1/cloaked/identity/${id}/phone/`);
  }

  static async deleteCloakedPhoneOnIdentity(id) {
    return api()
      .delete(`/api/v1/cloaked/identity/${id}/phone/`)
      .then((response) => {
        store.dispatch("deleteCacheAllPages", {
          url: "api/v2/cloaked/activity/",
        });
        return response;
      });
  }

  static async generateCloakedEmailForIdentity({ id, payload }) {
    return api().post(`api/v1/cloaked/identity/${id}/email/`, payload);
  }

  /* Delete Cloaked phone/email/username/password */
  static async deleteCloakedFieldAtUrl(url) {
    return api()
      .delete(url)
      .then((response) => {
        if (url.includes("phone") || url.includes("email")) {
          store.dispatch("deleteCacheAllPages", {
            url: "api/v2/cloaked/activity/",
          });
        }
        return response;
      });
  }

  static async deleteCloak(cloakId) {
    const url = `/api/v1/cloaked/identity/${cloakId}/`;
    return api()
      .delete(url)
      .then((response) => {
        store.dispatch("deleteCacheAllPages", {
          url: "api/v2/cloaked/activity/",
        });
        window.dispatchEvent(new CustomEvent("inbox-updated"));
        return response;
      });
  }

  static async updateMuteStatus(cloakId, muteStatus) {
    const url = `/api/v1/cloaked/identity/${cloakId}/mute/`;
    const payload = { mute: muteStatus };
    return api().post(url, payload);
  }

  static async updateCloak(cloakId, payload) {
    const url = `/api/v1/cloaked/identity/${cloakId}/`;
    return api().patch(url, payload);
  }

  static async updateCloakWebsite(cloakId, newUrl) {
    const url = "/api/v1/cloaked/identity/merge/";
    const payload = {
      base_identity_id: cloakId,
      website_url: newUrl,
    };
    return api().post(url, payload);
  }

  static async deleteCloakWebsite(cloakId) {
    const url = `api/v1/cloaked/identity/${cloakId}/`;
    const payload = {
      website_url: "",
      website: null,
    };
    return api().patch(url, payload);
  }

  /* Note: this is to optionally force add the
  alternate=true param so we can pass autofill and
  custom fields in one go, even if the identity doesn't
  have a url */
  static createIdentity(payload, alternate = false) {
    let url = "/api/v1/cloaked/identity/";
    if (
      payload.website_url ||
      payload.app_ref ||
      alternate ||
      payload.category
    ) {
      url += "?alternate=true";
    }
    return api()
      .post(url, payload)
      .then((response) => {
        store.dispatch("updateCloaks", [response.data]);
        return response;
      });
  }

  static generateDefaultCloak() {
    const url = "/api/v1/cloaked/identity/default-cloaks/";
    return api().post(url);
  }

  static async createCardIdentity(payload) {
    return api()
      .post("api/v1/cloaked/identity/?alternate=true", payload)
      .then((response) => {
        store.dispatch("updateCloaks", [response.data]);
      });
  }

  static async updateMuteState(payload) {
    return api().post("api/v1/cloaked/identity/mute/", payload);
  }

  static async patchIdentityUpdatedAt(identityId) {
    const payload = {
      last_used_at: moment().toISOString(),
    };
    return api()
      .patch(`api/v1/cloaked/identity/${identityId}/`, payload)
      .then((response) => {
        const identity = store.state.localdb.db_cloaks.find(
          (cloak) => cloak.id == identityId
        );

        store.dispatch("updateCloaks", [
          { ...JSON.parse(JSON.stringify(identity)), ...response.data },
        ]);
      });
  }

  static async bulkDeleteIdentity(identityIds) {
    const payload = {
      data: {
        identity_ids: identityIds,
      },
    };
    return api()
      .delete("api/v1/cloaked/identity/delete/", payload)
      .then((resp) => {
        window.dispatchEvent(new CustomEvent("inbox-updated"));
        return resp;
      });
  }

  static async frontloadIdentities(url) {
    url = url || "/api/v1/search/identity/?page_size=5000";
    return api().get(url);
  }
}
