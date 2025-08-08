export default {
  namespaced: true,
  state: {
    initialized: false,
    numbers: [],
    count: [],
  },
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
  },
  actions: {
    storeResults({ commit }, { results, count }) {
      commit("setInitialized");
      commit("setNumbers", results);
      commit("setCount", count);
    },
  },
};
