import api from "@/api/api";
import { phone_package } from "@/scripts/format";
import { getUserCountry } from "@/scripts/countries/countries";
import store from "@/store";

export default class MfaService {
  /* fetch all available mfa methods, at this time these are ['call', 'email', 'sms'] */
  /*
    TODO(madeline) backend has a bug where if a user has no recovery phone number
    they only return email as an available method so for now we're manually generating
    the available methods. Use the below in MFASetup when this has been fixed.
    */
  static async getAvailableMfaMethods() {
    return api().get("/api/v1/auth/mfa/available_methods/");
  }

  /* fetch unique list of enabled mfa methods */
  static async getEnabledMfaMethods() {
    return api()
      .get("/api/v1/auth/mfa/enabled_methods/")
      .then((response) => {
        const { enabled_methods } = response.data;
        store.dispatch("authentication/setMfaMethods", enabled_methods);
        return response;
      });
  }

  /* fetch all of a user's mfa devices, there is no filtering currently so you'll need to filter for confirmed=true client side */
  static async getMfaDevices() {
    return api().get("/api/v1/auth/mfa/");
  }

  /* add a new MFA device */
  static async addMfaDevice({ deviceId, method, methodId }) {
    const params = {
      /* always the navigator.userAgent on web, on mobile it's the mobile id (?) */
      device_id: deviceId,
      method,
    };
    switch (method) {
      case "call":
      case "sms":
        params.personal_phone_id = methodId;
        break;
      case "email":
        params.personal_email_id = methodId;
        break;
      /* no modifications needed for totp */
      default:
        break;
    }
    return await api().post(`/api/v1/auth/mfa/add/`, params);
  }

  /* to get confirmed=true, you need to send a code to the new device with the method */
  static async sendVerificationCode({ deviceId, method }) {
    const params = {
      /* always the navigator.userAgent on web, on mobile it's the mobile id (?) NOT the name or ID of the method/device*/
      device_id: deviceId,
      method,
    };
    return await api().post(`/api/v1/auth/mfa/send_challenge/`, params);
  }

  static async verifyVerificationCode({
    deviceId,
    method,
    recipient,
    sessionToken,
    totpToken,
  }) {
    const params = {
      /* always the navigator.userAgent on web, on mobile it's the mobile id (?) NOT the name or ID of the method/device*/
      device_id: deviceId,
      /* the TOTP code you get back from server */
      totp_token: totpToken,
      /* the token you get back in the res from send_challenge */
      session_token: sessionToken,
      recipient,
      method,
    };
    return await api().post(`/api/v1/auth/mfa/verify_challenge/`, params);
  }

  /* delete an individual device */
  static async deleteDevice(id) {
    return api()
      .delete(`/api/v1/auth/mfa/${id}/`)
      .then((response) => {
        return response;
      });
  }

  /* remove a specific method and all the devices that use it from MFA */
  static async removeMethodAndDevices(id, method) {
    const params = {
      method,
    };
    switch (method) {
      case "call":
      case "sms":
        params.personal_phone_id = id;
        break;
      case "email":
        params.personal_email_id = id;
        break;

      default:
        break;
    }
    return await api().post(`/api/v1/auth/mfa/remove/`, params);
  }

  /* turn off MFA entirely aka this will nuke ALL your methods/devices */
  static async disableAllMfaForAccount() {
    return await api().post(`api/v1/auth/mfa/disable/`, {});
  }

  /* get all pesonal phone numbers */
  static async getVerifiedPhoneNumbers() {
    return api().get(`/api/v1/phone/?verified=true`);
  }

  /* get individual phone (ie to show the phone number with FK of personal_phone_id in device endpoint call) */
  static async getPhoneById(id) {
    return api().get(`/api/v1/phone/${id}/`);
  }

  /* add a new phone number to the phone endpoint */
  static async addPersonalPhone({ phoneNumber }) {
    const phonePayload = phone_package(
      phoneNumber,
      getUserCountry(store.state.authentication?.user)
    );
    const payload = {
      ...phonePayload,
      primary: false,
      collection_name: "phone",
      user: store.state.authentication?.user?.url,
      collection: store.getters["authentication/collection"]("phone"),
    };
    return api().post(`/api/v1/phone/`, payload);
  }

  /* request a verification code for a new phone number */
  static async requestPhoneVerificationCode({ id }) {
    return api().get(`api/v1/phone/${id}/verify/`);
  }
  /* verify a verification code for a new phone */
  static async validatePhoneVerificationCode({
    id,
    phoneNumber,
    totpToken,
    sessionToken,
  }) {
    const params = {
      security_code: totpToken,
      session_token: sessionToken,
      phone_number: phoneNumber,
    };
    return api().patch(`api/v1/phone/${id}/verify/`, params);
  }

  /* get all pesonal emails */
  static async getVerifiedEmails() {
    return api().get(`/api/v1/email/?verified=true`);
  }

  /* get individual email (ie to show the phone number with FK of personal_phone_id in device endpoint call) */
  static async getEmailById(id) {
    return api().get(`/api/v1/email/${id}/`);
  }

  static async addPersonalEmail({ email }) {
    const payload = {
      email,
      primary: false,
      collection_name: "email",
      user: store.state.authentication?.user?.url,
      collection: store.getters["authentication/collection"]("email"),
    };
    return api().post(`/api/v1/email/`, payload);
  }
  /* request a verification code for a new email */
  static async requestEmailVerificationCode({ id }) {
    return api().get(`api/v1/email/${id}/verify/`);
  }
  /* verify a verification code for a new email */
  static async validateEmailVerificationCode({
    id,
    email,
    totpToken,
    sessionToken,
  }) {
    const params = {
      security_code: totpToken,
      session_token: sessionToken,
      email,
    };
    return api().patch(`api/v1/email/${id}/verify/`, params);
  }
}
