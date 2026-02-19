import api from "@/api/api";

export default class IdentityMonitoringService {
  static getMonitoringAlerts(context = null, page = 1) {
    return api()
      .get(
        `/api/v1/monitor/alerts/?context=${context}&page_size=20&page=${page}`
      )
      .then((response) => response.data);
  }

  static getMonitoringAlert(id, context = null) {
    return api()
      .get(`/api/v1/monitor/alerts/${id}/?context=${context}`)
      .then((response) => response.data);
  }
}
