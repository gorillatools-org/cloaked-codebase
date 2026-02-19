const defaultState = () => ({
  emailBreaches: [],
});

const state = defaultState();

const mutations = {
  mutateEmailBreaches(state, value) {
    state.emailBreaches = value;
  },
  reset(state) {
    Object.assign(state, defaultState());
  },
};

const actions = {
  setEmailBreaches({ commit }, breaches) {
    commit("mutateEmailBreaches", breaches);
  },
  reset({ commit }) {
    commit("reset");
  },
};

const getters = {
  getEmailBreaches(state) {
    return state.emailBreaches;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
