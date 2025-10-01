export default {
  namespaced: true,
  state: {
    pluginDetected: false,
    operatorDashboardLink: null,
    autoPasswordChangeUrl: null,
  },

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
  },
  getters: {
    pluginDetected: (state) => state.pluginDetected,
    operatorDashboardLink: (state) => state.operatorDashboardLink,
    autoPasswordChangeUrl: (state) => state.autoPasswordChangeUrl,
  },
  actions: {
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
