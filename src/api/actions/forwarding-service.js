import api from "@/api/api";

export default class ForwardingService {
  static getDefaultForwardingData() {
    return api().get("/api/v1/settings/default-forwarding/");
  }

  static disableEmailForwarding() {
    return api().post("/api/v1/settings/default-forwarding/", {
      email_id: -1,
    });
  }

  static disablePhoneForwarding() {
    return api().post("/api/v1/settings/default-forwarding/", {
      phone_id: -1,
    });
  }

  static enableEmailForwarding(emailId) {
    return api().post("/api/v1/settings/default-forwarding/", {
      email_id: emailId,
    });
  }

  static enablePhoneForwarding(phoneId) {
    return api().post("/api/v1/settings/default-forwarding/", {
      phone_id: phoneId,
    });
  }
}
