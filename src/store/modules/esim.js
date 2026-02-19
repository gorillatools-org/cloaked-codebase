const defaultState = () => ({
  esims: [],
  usage: {},
});

export default {
  namespaced: true,
  state: defaultState(),
  mutations: {
    setEsims(state, esims) {
      state.esims = esims;
    },
    setSimUsage(state, { simId, usageData }) {
      state.usage = { ...state.usage, [simId]: usageData };
    },
    reset(state) {
      Object.assign(state, defaultState());
    },
  },
  actions: {
    setEsims({ commit }, esims) {
      commit("setEsims", esims);
    },
    setSimUsage({ commit }, { simId, usageData }) {
      commit("setSimUsage", { simId, usageData });
    },
    reset({ commit }) {
      commit("reset");
    },
  },
  getters: {
    getEsims: (state) => state.esims,
    getUsageData: (state) => (simId) => {
      return state.usage[simId];
    },
  },
};
