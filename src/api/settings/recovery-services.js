import api from "@/api/api";

export default class RecoveryServices {
  static async getPrimaryEmail() {
    let endpoint = `/api/v1/email/?primary=true&verified=true`;
    return await api().get(endpoint);
  }

  static async checkPrimaryEmail(data) {
    const endpoint = "/api/v1/email/available_primary_email/";

    return await api().post(endpoint, data);
  }

  static async updatePrimaryEmail(data) {
    const endpoint = "/api/v1/email/update_primary/";

    return await api().post(endpoint, data);
  }

  static async savePrimaryEmail(data) {
    let endpoint = `/api/v1/email/`;
    return await api().post(endpoint, data);
  }

  static async sendVerficationEmailCode(id) {
    const endpoint = `/api/v1/email/${id}/verify/`;

    return await api().get(endpoint);
  }

  static async verifyEmail(id, data) {
    const endpoint = `/api/v1/email/${id}/verify/`;

    return await api().patch(endpoint, data);
  }

  static async getPrimaryPhone() {
    let endpoint = `/api/v1/phone/?primary=true`;
    return await api().get(endpoint);
  }

  static async checkPrimaryPhone(data) {
    const endpoint = "/api/v1/phone/available_primary_phone/";

    return await api().post(endpoint, data);
  }

  static async updatePrimaryPhone(data) {
    const endpoint = "/api/v1/phone/update_primary/";

    return await api().post(endpoint, data);
  }

  static async savePrimaryPhone(data) {
    let endpoint = `/api/v1/phone/`;
    return await api().post(endpoint, data);
  }

  static async sendVerficationPhoneCode(id) {
    const endpoint = `/api/v1/phone/${id}/verify/`;

    return await api().get(endpoint);
  }

  static async verifyPhone(id, data) {
    const endpoint = `/api/v1/phone/${id}/verify/`;

    return await api().patch(endpoint, data);
  }
}
