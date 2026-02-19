const defaultState = () => ({
  search: "",
  menu: false,
});

export default {
  namespaced: true,
  state: defaultState(),
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
    reset(state) {
      Object.assign(state, defaultState());
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
    reset({ commit }) {
      commit("reset");
    },
  },
  getters: {},
};
