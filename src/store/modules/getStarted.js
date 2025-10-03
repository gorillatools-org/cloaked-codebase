import UserService from "@/api/actions/user-service";
const defaultState = () => ({
  target: false,
  checklist: [],
});

export default {
  namespaced: true,
  state: defaultState(),
  mutations: {
    SET_OPEN: (state, target) => (state.target = target),
    getChecklist: (state, data) => (state.checklist = data),
    // For testing purposes.
    resetAllCheckListStatus: (state) => {
      state.checklist.forEach(async (item) => {
        for await (const { id } of item.tasks) {
          UserService.updateCheckListStatus({ id, status: "pending" });
        }
      });
    },
    reset(state) {
      Object.assign(state, defaultState());
    },
  },
  actions: {
    openGetStarted({ commit }, target) {
      commit("SET_OPEN", target);
    },
    reset({ commit }) {
      commit("reset");
    },
  },
  getters: {
    getEvent: (state) => {
      return state.target;
    },
    getCloakSetupList: (state) => {
      return state.checklist.find((item) => item.id === 1);
    },
    getOnlinePrivacyList: (state) => {
      return state.checklist.find((item) => item.id === 2);
    },
    getSecuredInformation: (state) => {
      return state.checklist.find((item) => item.id === 3);
    },
    totalStepsLeft: (state) => {
      if (!state.checklist.length) return "";
      const stepsLeft = state.checklist.reduce(
        (acc, item) => (acc += item.completion !== 100 ? 1 : 0),
        0
      );
      return `${stepsLeft} of ${state.checklist.length}`;
    },
    totalProgressPercentage: (state) => {
      if (!state.checklist.length) return 0;
      const checklists = state.checklist.reduce(
        (acc, item) => [...acc, ...item.tasks],
        []
      );
      const completed = checklists.reduce(
        (acc, item) =>
          (acc +=
            item.status === "completed" || item.status === "hidden" ? 1 : 0),
        0
      );
      return Math.floor((completed / checklists.length) * 100);
    },
    getCurrentStepData: (state) => (step) => {
      if (!state.checklist.length || !step)
        return {
          completion: 0,
          title: "",
          completedFraction: "",
        };
      const { title, completion, tasks } = state.checklist.find(
        (item) => item.id === step
      );
      const completedItems = tasks.filter(
        (item) => item.status === "completed" || item.status === "hidden"
      );
      return {
        completion,
        title,
        completedFraction: `${completedItems.length}/${tasks.length}`,
      };
    },
  },
};
