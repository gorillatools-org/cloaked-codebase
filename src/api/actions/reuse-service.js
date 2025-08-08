import api from "@/api/api";
import store from "@/store";

export default class ReuseService {
  static async getInitialCount() {
    if (!store.state.reuse.initialized) {
      const endpoint = `/api/v1/cloaked/number/expire/`;
      return await api()
        .get(endpoint)
        .then(({ data }) => {
          store.dispatch("reuse/storeResults", data);
          return data;
        });
    }
    return Promise.resolve();
  }
  static async getExpiringNumbers(page = 0) {
    const params = page > 0 ? `?page=${page}` : "";
    const endpoint = `/api/v1/cloaked/number/expire/${params}`;
    return await api()
      .get(endpoint)
      .then(({ data }) => {
        store.dispatch("reuse/storeResults", data);
        return data;
      });
  }
  static async keepPhoneNumberById(id) {
    const endpoint = `/api/v1/cloaked/number/${id}/expire/keep/`;
    return await api()
      .post(endpoint)
      .then(({ data }) => {
        return data.results;
      });
  }
  static async expirePhoneNumbersByIds(ids) {
    const endpoint = `/api/v1/cloaked/number/expire/delete/`;
    return await api()
      .post(endpoint, { number_ids: ids })
      .then(({ data }) => {
        return data.results;
      });
  }
}
