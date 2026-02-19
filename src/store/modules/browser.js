const defaultState = () => ({
  pluginDetected: false,
  operatorDashboardLink: null,
  autoPasswordChangeUrl: null,
});

export default {
  namespaced: true,
  state: defaultState(),

  mutations: {
    setPluginDetected(state, status) {
      state.pluginDetected = status;
    },
    setOperatorDashboardLink(state, link) {
      state.operatorDashboardLink = link;
    },
    setAutoPasswordChangeUrl(state, url) {
      state.autoPasswordChangeUrl = url;
    },
    reset(state) {
      Object.assign(state, defaultState());
    },
  },
  getters: {
    pluginDetected: (state) => state.pluginDetected,
    operatorDashboardLink: (state) => state.operatorDashboardLink,
    autoPasswordChangeUrl: (state) => state.autoPasswordChangeUrl,
  },
  actions: {
    reset({ commit }) {
      commit("reset");
    },
    savePluginDetected({ commit }, remove) {
      commit("setPluginDetected", !remove);
    },
    saveOperatorDashboardLink({ commit }, link) {
      commit("setOperatorDashboardLink", link);
    },
    saveAutoPasswordChangeUrl({ commit }, url) {
      commit("setAutoPasswordChangeUrl", url);
    },
  },
};
