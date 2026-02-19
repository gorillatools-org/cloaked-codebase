const defaultState = () => ({
  initialized: false,
  numbers: [],
  count: [],
});

export default {
  namespaced: true,
  state: defaultState(),
  mutations: {
    setInitialized(state) {
      state.initialized = true;
    },
    setNumbers(state, numbers = []) {
      state.numbers = numbers;
    },
    setCount(state, count) {
      state.count = count;
    },
    reset(state) {
      Object.assign(state, defaultState());
    },
  },
  actions: {
    reset({ commit }) {
      commit("reset");
    },
    storeResults({ commit }, { results, count }) {
      commit("setInitialized");
      commit("setNumbers", results);
      commit("setCount", count);
    },
  },
};
