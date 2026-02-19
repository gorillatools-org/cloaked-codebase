import { fetchErrorCodes as fetchErrorCodesApi } from "@/api/errors/errorCodes";

const LANGUAGE = "en"; // change to dynamic once language is implemented
const state = {
  errorCodes: null,
};

const mutations = {
  mutateErrorCodes(state, value) {
    state.errorCodes = value;
  },
};

const actions = {
  setErrorCodes({ commit }, errorCodes) {
    commit("mutateErrorCodes", errorCodes);
  },
  fetchErrorCodes({ commit }) {
    fetchErrorCodesApi().then((data) => {
      commit("mutateErrorCodes", data);
    });
  },
};

const getters = {
  getErrorCodes(state) {
    return state.errorCodes;
  },
  // Parameterized getter: returns a function you can call with (code)
  getErrorCodesByCode: (state) => (code) => {
    const map = state.errorCodes || {};
    const entry = map?.[code];
    if (!entry) return undefined;
    return {
      href: entry.href,
      short: entry?.language[LANGUAGE]?.short,
      long: entry?.language[LANGUAGE]?.long,
    };
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
