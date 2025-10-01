const state = {
  history: [],
};

const mutations = {
  mutateHistory(state, value) {
    state.history = [...state.history, value];
  },
};

const actions = {
  updateNavHistory({ commit }, newPage) {
    commit("mutateHistory", newPage);
  },
};

const getters = {
  previousRouteName(state) {
    if (state.history.length > 1) {
      return state.history[state.history.length - 1];
    }
    return null;
  },
  allInboxListRoutes() {
    return [
      "Inbox",
      "Texts",
      "Calls",
      "Emails",
      "Requests",
      "Starred",
      "RecentInbox",
      "FavoritesInbox",
      "CloakInbox",
      "CategoryInbox",
    ];
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
