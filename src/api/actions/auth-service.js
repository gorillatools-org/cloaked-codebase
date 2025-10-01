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
