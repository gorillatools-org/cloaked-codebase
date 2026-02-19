import api from "@/api/api";

export default class CustomEmailService {
  static async deleteEmailDomain(value) {
    return await api().delete(`/api/v1/cloaked/email/custom-domain/${value}/`);
  }

  static async postNewDomain(value) {
    return await api().post(`/api/v1/cloaked/email/custom-domain/`, {
      domain: value,
    });
  }

  static async verifyDomain(value) {
    return await api().post(
      `/api/v1/cloaked/email/custom-domain/${value}/verify/`
    );
  }

  static async getDomains() {
    return await api().get(`/api/v1/cloaked/email/custom-domain/`);
  }
}
