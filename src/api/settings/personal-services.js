import api from "@/api/api";
import store from "@/store";

export default class PersonalInfoServices {
  static async getInfo() {
    let endpoint = `/api/v1/cloaked/autofill/?primary=true`;
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        const autofillData = data.results && data.results[0];
        store.commit("insertAutofill", autofillData);
        return autofillData;
      });
  }

  static async createInfo(data) {
    const endpoint = `/api/v1/cloaked/autofill/`;
    let payload = {};
    payload["primary"] = true;
    payload["type"] = "personal";
    payload["user"] = store.state.authentication?.user?.url;
    payload["collection"] =
      store.getters["authentication/collection"]("autofill");
    payload["collection_name"] = "autofill";
    payload = Object.assign({}, payload, data);
    return await api()
      .post(endpoint, payload)
      .then((updated) => {
        store.commit("insertAutofill", updated.data);
        return updated;
      });
  }

  static async updateInfo(id, data) {
    const endpoint = `/api/v1/cloaked/autofill/${id}/`;
    return await api()
      .patch(endpoint, data)
      .then((updated) => {
        store.commit("insertAutofill", updated.data);
        return updated.data;
      });
  }

  // TODO: this is also found in email-services, we should consolidate
  static async getPersonalEmails() {
    let endpoint = "/api/v1/email/";
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        store.dispatch("settings/savePersonalEmails", data.results);
        return data.results;
      });
  }

  static async getPersonalPhones() {
    let endpoint = "/api/v1/phone/";
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        store.dispatch("settings/savePersonalPhones", data.results);
        return data.results;
      });
  }

  static async getAutofillCardNumber(cardId) {
    let endpoint = `/api/v1/cloaked/autofill-card/${cardId}/card_number/`;
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        return data;
      });
  }

  static async getAutofillCardCvv(cardId) {
    let endpoint = `/api/v1/cloaked/autofill-card/${cardId}/card_cvv/`;
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        return data;
      });
  }

  static async getAutofillCardExp(cardId) {
    let endpoint = `/api/v1/cloaked/autofill-card/${cardId}/card_expiry_date/`;
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        return data;
      });
  }

  static async postAutofillCard(payload) {
    let endpoint = "/api/v1/cloaked/autofill-card/";
    return await api().post(endpoint, payload);
  }

  static async updateAutofillCard(cardId, payload) {
    let endpoint = `/api/v1/cloaked/autofill-card/${cardId}/`;
    return await api().patch(endpoint, payload);
  }

  static async getAutofillCards(cardId, payload) {
    let endpoint = `/api/v1/cloaked/autofill-card/details/`;
    return await api().get(endpoint, payload);
  }

  static async deleteAutofillCard(endpoint) {
    return await api().delete(endpoint);
  }

  static async getUserProfile() {
    const url = "/api/v1/settings/user_profile/";
    return await api()
      .get(url)
      .then(({ data }) => {
        store.dispatch("setEmailTypeSetting", data.email_domain);
        store.dispatch("settings/savePermissions", data);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          return this.createUserProfileSettings();
        }
      });
  }

  static async updateUserProfile(payload) {
    const url = "/api/v1/settings/user_profile/";
    return await api()
      .patch(url, payload)
      .then(({ data }) => {
        store.dispatch("setEmailTypeSetting", data.email_domain);
        store.dispatch("settings/savePermissions", data);
      });
  }

  static async createUserProfileSettings() {
    const url = "/api/v1/settings/user_profile/";
    const payload = {
      email_type: store.state.profile.email_type,
    };
    return await api().post(url, payload);
  }

  static async setReceiptNumber(number = null) {
    const url = "/api/v1/settings/user_profile/receipt-number/";
    return await api().post(url, {
      number,
    });
  }
}
