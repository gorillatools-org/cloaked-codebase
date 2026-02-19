import api from "@/api/api";
import store from "@/store";

// NOTE: ?remove=true removes the cloak from any other category it is in
// so that a cloak can only be in one category at a time

export default class CategoryService {
  static async getCategories() {
    return api()
      .get("/api/v1/category/?page_size=32")
      .then((response) => {
        store.commit("setCategories", response.data.results);
      });
  }

  static async addCloaksToCategory(categoryId, cloakIds) {
    const payload = {
      identity_ids: cloakIds,
    };
    return api()
      .post(`/api/v1/category/${categoryId}/identity/?remove=true`, payload)
      .then((response) => {
        const newCloaksInCategory = store.state.localdb.db_cloaks.filter(
          (cloak) => cloakIds.includes(cloak.id)
        );
        store.dispatch(
          "updateCloaks",
          newCloaksInCategory.map((c) => ({
            ...c,
            categories: [parseInt(categoryId)],
          }))
        );

        return response;
      });
  }

  static async getNextCategoryPage(url) {
    return api().get(url);
  }

  static async deleteCategory(categoryId) {
    const url = `/api/v1/category/${categoryId}/`;
    return api()
      .delete(url)
      .then(() => {
        store.commit("deleteCategory", categoryId);
      });
  }

  static async refreshCategory(source, categoryId) {
    const url = `api/v1/category/${categoryId}/`;
    return api(source).get(url);
  }

  static async removeCloaksFromCategory(categoryId, identityIds) {
    const payload = {
      data: { identity_ids: identityIds },
    };
    const url = `/api/v1/category/${categoryId}/identity/`;

    return api()
      .delete(url, payload)
      .then((response) => {
        store.dispatch(
          "updateCloaks",
          identityIds.map((id) => {
            const identity = store.state.localdb.db_cloaks.find(
              (identity) => identity.id === id
            );
            identity.categories = identity.categories.filter(
              (catId) => catId !== categoryId
            );
            return identity;
          })
        );
        return response;
      });
  }

  static async createCategory(categoryName) {
    const payload = { name: categoryName };
    const url = "/api/v1/category/";

    return api()
      .post(url, payload)
      .then((response) => {
        store.commit("addNewCategory", response.data);
        return response;
      });
  }

  static async updateCategory(categoryId, categoryName) {
    const payload = { name: categoryName };
    const url = `/api/v1/category/${categoryId}/`;

    return api()
      .patch(url, payload)
      .then((response) => {
        store.commit("updateCategory", response.data);
        return response;
      });
  }
}
