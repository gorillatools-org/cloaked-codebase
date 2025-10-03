import CallGuardService from "@/api/actions/call-guard-service";
import PhoneService from "@/api/actions/phone-service";

const defaultState = () => ({
  calls: [],
  setupStatus: null,
  loading: {
    calls: false,
    setup: false,
  },
  error: {
    message: null,
    code: null,
    details: null,
    timestamp: null,
  },
});

export default {
  namespaced: true,
  state: defaultState(),
  mutations: {
    reset(state) {
      Object.assign(state, defaultState());
    },
    setCalls(state, calls) {
      state.calls = calls;
    },
    setSetupStatus(state, status) {
      state.setupStatus = status;
    },
    setLoading(state, { key, value }) {
      state.loading[key] = value;
    },
    setError(state, error) {
      state.error = {
        message: error.message || "An unexpected error occurred",
        code: error.code || error.status || null,
        details: error.details || error.response?.data || null,
        timestamp: new Date().toISOString(),
      };
    },
    clearError(state) {
      state.error = {
        message: null,
        code: null,
        details: null,
        timestamp: null,
      };
    },
  },
  actions: {
    async fetchCalls({ commit }) {
      commit("setLoading", { key: "calls", value: true });
      commit("clearError");
      try {
        const response = await CallGuardService.getCalls();
        commit("setCalls", response.data.results);
      } catch (error) {
        commit("setError", {
          message: error.message,
          code: error.response?.status,
          details: error.response?.data,
        });
      } finally {
        commit("setLoading", { key: "calls", value: false });
      }
    },
    async fetchSetupStatus({ commit }) {
      commit("setLoading", { key: "setup", value: true });
      commit("clearError");
      try {
        const phoneNumbers = await PhoneService.getUserPhoneNumbers();
        const primaryPhone = phoneNumbers.data.results.find(
          (item) => item.verified && item.primary
        );

        if (primaryPhone) {
          const status = await CallGuardService.getSetupCallStatus();
          commit("setSetupStatus", status.data.completed);
        } else {
          commit("setSetupStatus", false);
        }
      } catch (error) {
        commit("setError", {
          message: error.message,
          code: error.response?.status,
          details: error.response?.data,
        });
        commit("setSetupStatus", false);
      } finally {
        commit("setLoading", { key: "setup", value: false });
      }
    },
    reset({ commit }) {
      commit("reset");
    },
  },
  getters: {
    isLoading: (state) => Object.values(state.loading).some((value) => value),
    hasError: (state) => state.error.message !== null,
    getCallById: (state) => (id) => state.calls.find((call) => call.id === id),
    isSetupComplete: (state) => state.setupStatus === true,
    getErrorDetails: (state) => state.error,
  },
};
