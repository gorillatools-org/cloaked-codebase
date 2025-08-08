import api from "@/api/api";

export default class PhoneService {
  static getUserPhoneNumbers() {
    return api()
      .get("/api/v1/phone/")
      .then((res) => res)
      .catch((err) => err);
  }

  static getUserPhoneNumbersByCreatedAt() {
    return api().get("/api/v1/phone/?ordering=created_at");
  }

  static getPhoneById(phoneId) {
    return api().get(`/api/v1/phone/${phoneId}/`);
  }

  static addPhone(payload) {
    return api().post(`/api/v1/phone/`, payload);
  }

  static createPhone(payload) {
    return api().post(`/api/v1/phone/create_primary/`, payload);
  }

  static sendVerificationCode(phoneId, context = null) {
    const params = new URLSearchParams();

    if (context) {
      params.append("context", context);
    }

    return api().get(`api/v1/phone/${phoneId}/verify/`, { params });
  }

  static verifyVerificationCode(phoneId, payload, context = null) {
    const params = new URLSearchParams();

    if (context) {
      params.append("context", context);
    }

    return api().patch(`api/v1/phone/${phoneId}/verify/`, payload, { params });
  }

  static makePrimary(phoneId) {
    return api().patch(`/api/v1/phone/${phoneId}/`, { primary: true });
  }

  static deletePhone(phoneUrl) {
    return api().delete(phoneUrl);
  }
}
