import api from "@/api/api";

export default class CommSettingsService {
  static getCommSettingsForIdentity(identityId) {
    return api().get(`api/v1/cloaked/identity/${identityId}/comm_settings/`);
  }

  static updateCommSettingsForIdentity({ identityId, payload }) {
    return api().patch(
      `api/v1/cloaked/identity/${identityId}/comm_settings/`,
      payload
    );
  }
}
