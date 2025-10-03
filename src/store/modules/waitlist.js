const defaultState = () => ({
  waitlist: null,
});

export default {
  state: defaultState(),
  mutations: {
    setWaitlist(state, waitlist) {
      state.waitlist = waitlist;
    },
    updateWaitlist(state, waitlist) {
      state.waitlist = state.waitlist.map((item) =>
        item.id === waitlist.id ? waitlist : item
      );
    },
    resetState(state) {
      Object.assign(state, defaultState());
    },
  },
  getters: {
    heimdallWaitlistActive: (state) => {
      const waitlist = state?.waitlist;

      const heimdallEntry = waitlist?.find(
        (item) => item.internal_name === "heimdall"
      );

      if (!heimdallEntry) return false;

      if (
        heimdallEntry.close_date &&
        new Date(heimdallEntry.close_date) < new Date()
      ) {
        return false;
      }

      return true;
    },
    oneRingWaitlistActive: (state) => {
      const waitlist = state?.waitlist;

      const oneRingEntry = waitlist?.find(
        (item) => item.internal_name === "one_ring"
      );

      if (!oneRingEntry) return false;

      if (
        oneRingEntry.close_date &&
        new Date(oneRingEntry.close_date) < new Date()
      ) {
        return false;
      }

      return true;
    },
  },
  actions: {
    resetWaitlistStore({ commit }) {
      commit("resetState");
    },
  },
};
