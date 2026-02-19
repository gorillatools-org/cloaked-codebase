import api from "@/api/api";
import store from "@/store";

export default class EmailService {
  static getUserEmails() {
    return api()
      .get("/api/v1/email/")
      .then((resp) => {
        store.dispatch("settings/savePersonalEmails", resp?.data?.results);
        return resp;
      })
      .catch((err) => err);
  }

  static getUserEmailsByCreatedAt() {
    return api().get("/api/v1/email/?ordering=created_at");
  }

  static getEmailById(emailId) {
    return api().get(`/api/v1/email/${emailId}/`);
  }

  static addEmail(payload) {
    return api()
      .post(`/api/v1/email/`, payload)
      .then((response) => {
        store.dispatch("settings/saveNewPersonalEmail", response?.data);
        return response;
      });
  }

  static sendVerificationCode(emailId) {
    return api().get(`api/v1/email/${emailId}/verify/`);
  }

  static verifyVerificationCode(emailId, payload) {
    return api().patch(`api/v1/email/${emailId}/verify/`, payload);
  }
  static sendVerificationLink(emailId) {
    return api().get(`api/v1/email/${emailId}/verify-email/`);
  }

  static makePrimary(emailId) {
    return api()
      .patch(`/api/v1/email/${emailId}/`, { primary: true })
      .then((response) => {
        store.dispatch("settings/updatePersonalEmail", response?.data);
        return response;
      });
  }

  /* API for user to change cloak email to a newly generated email or email provided by user
   */
  static getCloakedEmailChangeable(emailId) {
    return api().get(`api/v1/cloaked/email/${emailId}/change/email/`);
  }

  static updateCloakedEmail({ emailId, payload }) {
    return api().post(`api/v1/cloaked/email/${emailId}/change/email/`, payload);
  }

  static deleteEmail(emailUrl) {
    return api()
      .delete(emailUrl)
      .then((response) => {
        store.dispatch("settings/deletePersonalEmail", { url: emailUrl });
        return response;
      });
  }
}
