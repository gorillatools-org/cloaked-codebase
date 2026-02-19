import api from "@/api/api";
import store from "@/store";

export default class TrashService {
  static async getTrash(page = 1) {
    return await api().get(`/api/v1/trash/?page=${page}`);
  }

  static async deletePermanently(itemIds) {
    return await api().post(`/api/v1/trash/identifier/delete/`, {
      item_ids: itemIds,
    });
  }
  static async emptyTrash() {
    return await api().delete(`/api/v1/trash/identifier/`);
  }
  static async restoreToIdentity(itemIds) {
    return await api()
      .post(`/api/v1/trash/identifier/restore/`, {
        item_ids: itemIds,
        restore_to_previous: true,
      })
      .then((response) => {
        store.dispatch("deleteCacheAllPages", {
          url: "api/v2/cloaked/activity/",
        });
        return response;
      });
  }
  static async restoreToNewIdentity(itemIds) {
    return await api()
      .post(`/api/v1/trash/identifier/restore/`, {
        item_ids: itemIds,
        restore_to_previous: false,
      })
      .then((response) => {
        store.dispatch("deleteCacheAllPages", {
          url: "api/v2/cloaked/activity/",
        });
        return response;
      });
  }
}
