import api from "@/api/api";
import store from "@/store";

export default class UserService {
  static async getUserDetails() {
    return await api().get("/api/v1/user/");
  }

  static async changeUserPassword(payload) {
    const endpoint = `/api/v2/auth/change-password/`;
    return await api().post(endpoint, payload);
  }

  static async deactivateUser() {
    const endpoint = `/api/v1/user/${store.state.authentication?.user?.id}/`;
    const payload = { is_active: false };
    return await api().patch(endpoint, payload);
  }

  static async requestDeleteAccountOTP() {
    const endpoint = `/api/v1/user/${store.state.authentication?.user?.id}/delete-request/`;
    return await api().post(endpoint);
  }

  static async getUserState() {
    const endpoint = `/api/v1/user/state/`;
    return await api().get(endpoint);
  }

  static async collections() {
    const endpoint = "/api/v1/installedcollection/";
    return await api().get(endpoint);
  }

  static async getFlags() {
    return api()
      .get("/api/v1/settings/product-use/")
      .then(({ data }) => {
        return store.commit("onboardFlags", { flags: data.onboarding_meta });
      });
  }

  static async getNewOnboardingFlags() {
    return api()
      .get("/api/v1/settings/product-use/data-deletion/")
      .then(({ data }) => {
        return store.commit("newOnboardingFlags", { flags: data });
      });
  }

  static async setNewOnboardingFlag(flag, value) {
    const payload = { [flag]: value };
    return api()
      .post("/api/v1/settings/product-use/data-deletion/", payload)
      .then(({ data }) => {
        return store.commit("newOnboardingFlags", { flags: data });
      });
  }

  static async setFlag({ name, value }) {
    store.commit("onboardFlags", { flags: { [name]: value } });
    return api(null, { "content-type": "application/json-patch+json" }).patch(
      "/api/v1/settings/product-use/",
      [
        {
          op: "add",
          path: `/onboarding_meta/${name}`,
          value: value,
        },
      ]
    );
  }

  static async setProductUseFlag({ name, value }) {
    store.commit("setFlags", { flags: { [name]: value } });
    return api(null, { "content-type": "application/json-patch+json" }).patch(
      "/api/v1/settings/product-use/",
      [
        {
          op: "add",
          path: `/${name}`,
          value: value,
        },
      ]
    );
  }

  static async deleteUserAccount({ userId, payload }) {
    return api().post(`/api/v1/user/${userId}/state/`, payload);
  }

  static async fetchGetStartedCheckList() {
    return api()
      .get("/api/v1/user-checklist/")
      .then(({ data }) => {
        // BE should send the correct url, but patching it up nonetheless.
        const URL = import.meta.env.VITE_REDIRECT_URI;
        const temp = data.map(({ tasks, ...item }) => ({
          ...item,
          tasks: tasks.map(({ link_url, ...task }) => ({
            ...task,
            link_url:
              link_url && link_url.includes(URL)
                ? link_url.replace(URL, "")
                : link_url,
          })),
        }));
        store.commit("getStarted/getChecklist", temp);
      });
  }

  static async updateCheckListStatus(params) {
    return api().post(`/api/v1/user-checklist/task/`, params);
  }

  static async updateAndFetchGetStartedChecklist(params) {
    await this.updateCheckListStatus(params);
    await this.fetchGetStartedCheckList();
  }

  static async getEncryptionStatus() {
    return api().get("/api/v1/data/encryption/authenticate/");
  }

  static toggleBasicMode(isBasicModeEnabled) {
    return api()
      .post(`/api/v1/user/enable-mode/`, { is_advanced: !isBasicModeEnabled })
      .then((res) => res)
      .catch((err) => err);
  }
}
