export default {
  namespaced: true,
  state: {
    search: "",
    menu: false,
  },
  mutations: {
    setSearch(state, search) {
      state.search = search;
    },
    toggleInbox(state, event) {
      if (state.menu) {
        state.menu = false;
      } else {
        state.menu = event;
      }
    },
    closeInboxMenu(state) {
      state.menu = false;
    },
  },
  actions: {
    setSearch({ commit }, search) {
      commit("setSearch", search);
    },
    toggleInbox({ commit }, event) {
      commit("toggleInbox", event);
    },
    closeInboxMenu({ commit }) {
      commit("closeInboxMenu");
    },
  },
  getters: {},
};
