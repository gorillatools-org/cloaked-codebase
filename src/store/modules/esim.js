export default {
  namespaced: true,
  state: {
    esims: [],
    usage: {},
  },
  mutations: {
    setEsims(state, esims) {
      state.esims = esims;
    },
    setSimUsage(state, { simId, usageData }) {
      state.usage = { ...state.usage, [simId]: usageData };
    },
  },
  actions: {
    setEsims({ commit }, esims) {
      commit("setEsims", esims);
    },
    setSimUsage({ commit }, { simId, usageData }) {
      commit("setSimUsage", { simId, usageData });
    },
  },
  getters: {
    getEsims: (state) => state.esims,
    getUsageData: (state) => (simId) => {
      return state.usage[simId];
    },
  },
};
