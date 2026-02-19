export default {
  namespaced: true,
  state: {
    isOnboardingEnabled: false,
  },
  mutations: {
    setOnboardingEnabled(state, value) {
      state.isOnboardingEnabled = value;
    },
  },
  getters: {
    isOnboardingEnabled: (state) => state.isOnboardingEnabled,
  },
  actions: {
    enableOnboarding({ commit }) {
      commit("setOnboardingEnabled", true);
    },
    disableOnboarding({ commit }) {
      commit("setOnboardingEnabled", false);
    },
  },
};
