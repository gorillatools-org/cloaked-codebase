import { db } from "@/store/modules/localdb";
// import router from "@/routes/router";

export default {
  state: {
    active: false,
    cloakCreate: false,
    cloakDetails: false,
    cloak: null,
    prevRoute: "/",
    cardPanel: false,
  },

  mutations: {
    openCardPanel: (state) => {
      state.cardPanel = true;
    },
    closeCardPanel: (state) => {
      state.cardPanel = false;
    },
    openRightPanel: (state) => {
      state.active = true;
    },
    setCloseRightPanel: (state) => {
      if (!state.active) {
        return;
      }

      // NOTE: if right panel is closing, then all associated views should close with it
      state.active = false;

      setTimeout(() => {
        state.cloakCreate = false;
        state.cloakDetails = false;
        state.cloak = null;
      }, 250);
    },
    openCloakCreate: (state) => {
      state.active = true;
      state.cloakCreate = true;
      state.cloakDetails = false;
      state.cloak = null;
    },
    setOpenCloakDetails: (state, cloak) => {
      state.active = true;
      state.cloakDetails = true;
      state.cloakCreate = false;
      state.cloak = cloak;
    },
    updateCloakDetails: (state, cloak) => {
      state.cloak = cloak;
    },
  },

  getters: {
    getRightPanelStatus: (state) => {
      return state.active;
    },
    getCloakCreate: (state) => {
      return state.cloakCreate;
    },
    getCloakDetails: (state) => {
      return state.cloakDetails;
    },
    getPrevRoute: (state) => {
      return state.prevRoute;
    },
    getTempCloak: (state) => {
      return state.tempCloak;
    },
    getSavingTempCloak: (state) => {
      return state.savingTempCloak;
    },
    getCardPanel: (state) => {
      return state.cardPanel;
    },
  },

  actions: {
    openCardPanel({ commit }) {
      commit("openCardPanel");
    },
    closeCardPanel({ commit }) {
      commit("closeCardPanel");
    },
    deleteTempCloak() {
      db.cloaks.delete(-1);
    },
    openRightPanel({ commit }) {
      commit("openRightPanel");
    },
    closeRightPanel({ commit, dispatch }) {
      commit("setCloseRightPanel");
      dispatch("deleteTempCloak");
    },
    openCloakDetails({ commit, dispatch }, { cloak }) {
      dispatch("deleteTempCloak");
      commit("setOpenCloakDetails", cloak);
      // router.push({ name: "IdentityDetails", params: { id: cloak.id } });
    },
    updateCloakDetails({ commit, dispatch, state }, cloak) {
      if (state.cloak.id === cloak.id) {
        commit("updateCloakDetails", cloak);
      }
      return dispatch("updateCloaks", [cloak]);
    },
    closeIfCloakDeleted({ commit, state }, cloakIds) {
      if (cloakIds.inlcudes(state.cloak.id)) {
        commit("setCloseRightPanel");
      }
    },
  },
};
