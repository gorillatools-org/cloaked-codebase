import api from "@/api/api";

export default class ImporterService {
  static async createImport(payload) {
    return await api().post("/api/v1/cloaked/importer/import/", payload);
  }
  static async getImportStatus(taskId) {
    return await api().get(
      `/api/v1/cloaked/importer/metadata/status/?task_id=${taskId}`
    );
  }
  static async getImportedIdentities(url) {
    return await api().get(url);
  }
}
