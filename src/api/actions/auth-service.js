import api from "@/api/api";

export default class AuthService {
  static async login(data) {
    const headers = {
      headers: { "Content-type": "application/x-www-form-urlencoded" },
    };
    const params = new URLSearchParams(data).toString();
    const anonymous = true;
    return await api(anonymous).post("/o/token/", params, headers);
  }

  /**
   * Create a deep link for the user - used to download the mobile app
   * @param {Object} payload - The payload for the deep link
   * @param {String} payload.username - The username of the user
   * @param {String} [payload.posthog_uuid] - The posthog uuid of the user
   * @returns {Promise<{url: string}>} The response from the API
   */
  static async createDeepLink(
    payload = { username: null, posthog_uuid: null }
  ) {
    return await api()
      .post("/api/v2/auth/create-deep-link/", payload)
      .then((response) => response.data);
  }

  /**
   * Create an unauthenticated Branch deep link - used to download the mobile app
   * @param {Object} payload - The payload for the deep link
   * @param {String} payload.phone_number - The phone number of the user
   * @param {String} [payload.posthog_uuid] - The posthog uuid of the user
   * @param {String} [payload.turnstile_token] - The turnstile (captcha) token
   * @returns {Promise<{url: string}>} The response from the API
   */
  static async openPhoneBasedDownloadAppDeepLink(
    payload = { phone_number: null, posthog_uuid: null, turnstile_token: null }
  ) {
    return await api(true)
      .post("/api/v1/auth/register-phone/", payload)
      .then((response) => response.data);
  }

  static async refreshToken(data) {
    const headers = {
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
    };
    const params = new URLSearchParams(data).toString();
    const anonymous = true;
    return await api(anonymous).post("/o/token/", params, headers);
  }
  static async logout() {
    return await api().post("/api/v1/auth/logout/");
  }
  static async passPhrase() {
    return await api().get("/api/v1/encryption/recovery-code/");
  }
  static async confirmPassword(userId, password) {
    return await api().post(`/api/v1/user/${userId}/password/confirm/`, {
      password,
    });
  }
}
