import api from "@/api/api";

export default class CallGuardService {
  static async getCalls(pageSize = 1000) {
    return await api().get(`/api/v1/agent/call/log/?page_size=${pageSize}`);
  }

  static async getSetupCallStatus() {
    return await api().get("/api/v1/agent/call/setup-call-status/");
  }
}
