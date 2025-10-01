const state = {
  emailBreaches: [],
};

const mutations = {
  mutateEmailBreaches(state, value) {
    state.emailBreaches = value;
  },
};

const actions = {
  setEmailBreaches({ commit }, breaches) {
    commit("mutateEmailBreaches", breaches);
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
