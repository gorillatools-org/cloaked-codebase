import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

import callGuard from "./modules/call-guard";

import rightPanel from "./modules/rightPanel.js";
import subscription from "./modules/subscription.js";
import modal from "./modules/modal.js";
import cards from "./modules/cards.js";
import media from "./modules/media.js";
import reuse from "./modules/reuse.js";
import getStarted from "./modules/getStarted.js";
import accountsImporter from "./modules/accounts-importer/index.js";
import recentlyImported from "./modules/recentlyImported.js";
import authentication from "./modules/authentication.js";
import browser from "./modules/browser.js";
import inbox from "./modules/inbox.js";
import navigation from "./modules/navigation.js";
import localdb from "./modules/localdb.js";
import settings from "./modules/settings.js";
import dataDelete from "./modules/data-delete.js";
import breaches from "./modules/breaches.js";
import esim from "./modules/esim.js";
import features from "./modules/features.js";
import cloakedPayOnboarding from "./modules/cloaked-pay-onboarding.js";
import { extensionMessaging } from "@/scripts/messaging";
import waitlist from "./modules/waitlist.js";
import errors from "./modules/errors.js";

const defaultState = () => {
  return {
    verifiedPhones: [],
    identities: [],
    bodyOverflowHidden: false,
    identitySearch: "",
    identity: null,
    isMultiSelect: false,
    defaultForwardingEmail: null,
    defaultForwardingPhone: null,
    locked: false,
    support_cloak: null,
    compose_message: {
      identity: null,
      payload: null,
    },
    encryption: {
      active: false,
      enabled: false,
      feature_flag_exists: false,
      secret_key: "",
    },
    user: {
      created_at: null,
      id: null,
      username: null,
      url: null,
    },
    flags: {
      onboarding: null,
      newOnboardingFlags: null,
    },
    collection: {
      autofill: null,
      email: null,
      phone: null,
      password: null,
    },
    autofill: {},
    activity_type: null,
    activities: [],
    ui: {
      identitySortType: "-created_at",
      open_dialog: false,
      webviewMode: false,
      preference: {
        open: false,
        selected: "account",
        right: null,
        step: null,
      },
      activities: {
        type: null,
        cloak_id: null,
      },
      modals: {
        mobileAppModal: false,
        eSimModalAllUsers: false,
      },
      dashboard: {
        sort: "-created_at",
        filter: [],
      },
    },
    profile: {
      email_type: "random",
    },
    categories: {
      permanent: [{ name: "Favorites" }, { name: "Ignored" }],
      custom: [],
    },
  };
};
export default new Vuex.Store({
  state: defaultState(),
  mutations: {
    compose(state, identity) {
      state.compose_message.identity = identity;
      state.compose_message.payload = null;
    },
    replyTo(state, { identity, activity_id, payload }) {
      state.compose_message.identity = identity;
      state.compose_message.activity_id = activity_id;
      state.compose_message.payload = payload;
    },
    setIsMultiSelect(state, status) {
      state.isMultiSelect = status;
    },
    registerSupport(state, support) {
      state.support_cloak = support;
    },

    openPreference(state, { selected, right = null, step = null }) {
      state.ui.preference.selected = selected;
      state.ui.preference.right = right;
      state.ui.preference.step = step;
    },

    setPreferenceRightPanel(state, { right = null }) {
      state.ui.preference.right = right;
    },

    setPreferenceStep(state, { step = null }) {
      state.ui.preference.step = step;
    },

    clipBody(state) {
      state.ui.open_dialog = true;
    },
    unclipBody(state) {
      state.ui.open_dialog = false;
    },
    setWebviewMode(state, enabled) {
      state.ui.webviewMode = enabled;
    },
    insertUser(state, user) {
      state.user = user;
    },
    insertAutofill(state, autofill) {
      state.autofill = autofill;
    },
    encryptionStatus(state, status) {
      state.encryption.active = status;
    },
    encryptionFeatureFlag(state, status) {
      state.encryption.feature_flag_exists = status;
    },
    logout(state) {
      Object.assign(state, defaultState());
    },
    onboardFlags(state, { flags }) {
      state.flags.onboarding = { ...state.flags.onboarding, ...flags };
    },
    setFlags(state, { flags }) {
      state.flags = { ...state.flags, ...flags };
    },
    newOnboardingFlags(state, { flags }) {
      state.flags.newOnboardingFlags = flags || {};
    },
    closeCloak: (state) => {
      state.identity = [];
      state.bodyOverflowHidden = false;
    },
    setBodyOverflow: (state, override) => {
      state.bodyOverflowHidden = override;
    },
    setSecretKey(state, secret_key) {
      state.encryption.secret_key = secret_key;
    },
    setEncryptionStatus(state, status) {
      state.encryption.enabled = status;
    },
    setEmailTypeSetting(state, value) {
      state.profile.email_type = value;
    },
    setSearch: (state, value) => {
      state.identitySearch = value;
    },
    setCategories: (state, categories) => {
      state.categories.custom = categories;
    },
    deleteCategory: (state, categoryId) => {
      const filteredCategories = state.categories.custom.filter(
        (cat) => cat.id != categoryId
      );
      state.categories.custom = filteredCategories;
    },
    addNewCategory: (state, category) => {
      state.categories.custom = [category, ...state.categories.custom];
    },
    updateCategory: (state, category) => {
      const matchingIdx = state.categories.custom.findIndex(
        (cat) => cat.id == category.id
      );
      const stateCategoriesCopy = [...state.categories.custom];
      stateCategoriesCopy.splice(matchingIdx, 1, category);
      state.categories.custom = stateCategoriesCopy;
    },
    setVerifiedPhones: (state, phones) => {
      state.verifiedPhones = phones;
    },
    toggleMobileAppModal: (state, visible) => {
      state.ui.modals.mobileAppModal = visible;
    },
    toggleESimModalAllUsersModal: (state, visible) => {
      state.ui.modals.eSimModalAllUsers = visible;
    },
    setSortType: (state, sortType) => {
      state.ui.identitySortType = sortType;
    },
    updateCloakCard: function (state, { id, cloaked_card }) {
      if (state.rightPanel?.cloak?.id === id) {
        state.rightPanel.cloak = {
          ...state.rightPanel.cloak,
          cloaked_card,
        };
      }
    },
    updateCloakInfoOnCards: function (state, cloak) {
      if (state.cards?.cards) {
        const newResults = state.cards.cards.results.map((card) => {
          if (card.identity_id === cloak.id) {
            // Update the fields from cloak:
            return {
              ...card,
              identity_name: cloak.nickname,
              identity_color: cloak.color,
              identity_logo_url: cloak.logo_url,
            };
          } else {
            return card;
          }
        });

        state.cards.cards = {
          ...state.cards.cards,
          results: newResults,
        };
      }
    },
  },
  getters: {
    identities: (state) => {
      return state.identities;
    },
    auth_token(state) {
      if (
        state.authentication.auth &&
        state.authentication.auth.access_token.length > 0
      ) {
        return state.authentication.auth.access_token;
      }
      if (
        state.authentication.guest &&
        state.authentication.guest.access_token.length > 0
      ) {
        return state.authentication.guest.access_token;
      }
      return null;
    },
    refresh_token(state) {
      if (
        state.authentication.auth &&
        state.authentication.auth.refresh_token
      ) {
        return state.authentication.auth.refresh_token;
      }
      return null;
    },
    secret_key: (state) => {
      return state.encryption.secret_key;
    },
    getFlag: (state) => (name) => {
      return state.flags.onboarding && state.flags.onboarding[name];
    },
    getDefaultForwardingPhone: (state) => {
      return state.defaultForwardingPhone;
    },
    getDefaultForwardingEmail: (state) => {
      return state.defaultForwardingEmail;
    },

    getIdentitySearch: (state) => {
      return state.identitySearch;
    },

    bodyOverflowHidden: (state) => {
      return state.bodyOverflowHidden;
    },

    getIdentity: (state) => {
      return state.identity;
    },
    getCategories: (state) => {
      const customCategories = state.categories.custom;
      return [...customCategories];
    },
    getCustomCategories: (state) => {
      return state.categories.custom;
    },
    getVerifiedPhones: (state) => {
      return state.verifiedPhones;
    },
    getCloak: (state) => {
      const cloakFromDb = state?.localdb?.db_cloaks?.find(
        (c) => c.id === state.rightPanel?.cloak?.id
      );
      return cloakFromDb || state.rightPanel?.cloak || null;
    },
    dbLoaded: (state) => {
      const hasCloaks = state.localdb.cloakCount > 0;
      const someCloaksHaveBeenSaved =
        hasCloaks && state.localdb.db_cloaks.length !== 0;
      return (
        state.localdb.dbLoaded && (hasCloaks ? someCloaksHaveBeenSaved : true)
      );
    },
    isNewUser: (state) => {
      const NEW_USER_THRESHOLD_IN_DAYS = 14;
      const MILLISECONDS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

      return (
        new Date().getTime() -
          new Date(state.authentication?.user?.created_at).getTime() <
        NEW_USER_THRESHOLD_IN_DAYS * MILLISECONDS_IN_ONE_DAY
      );
    },
    isV2User: (state) => {
      return state.authentication?.user?.encryption_status === 3;
    },
  },
  actions: {
    setSortType({ commit }, sortType) {
      localStorage.setItem("identitySortType", sortType);
      commit("setSortType", sortType);
    },
    toggleMobileAppModal({ commit }, visible) {
      commit("toggleMobileAppModal", visible);
    },
    toggleESimModalAllUsersModal({ commit }, visible) {
      commit("toggleESimModalAllUsersModal", visible);
    },
    setUser({ commit }, user) {
      commit("insertUser", user);
    },
    setEmailTypeSetting({ commit }, value) {
      commit("setEmailTypeSetting", value);
    },
    logout({ commit, dispatch }) {
      // Reset all modules that have logout/reset actions
      dispatch("authentication/logout");
      dispatch("resetRightPanelStore", null, { root: true }).catch(() => {});
      dispatch("subscription/reset", null, { root: true }).catch(() => {});
      dispatch("resetModalStore", null, { root: true }).catch(() => {});
      dispatch("resetCardsStore", null, { root: true }).catch(() => {});
      dispatch("media/reset", null, { root: true }).catch(() => {});
      dispatch("reuse/reset", null, { root: true }).catch(() => {});
      dispatch("getStarted/reset", null, { root: true }).catch(() => {});
      dispatch("accountsImporter/reset", null, { root: true }).catch(() => {});
      dispatch("recentlyImported/reset", null, { root: true }).catch(() => {});
      dispatch("browser/reset", null, { root: true }).catch(() => {});
      dispatch("inbox/reset", null, { root: true }).catch(() => {});
      dispatch("resetLocalDBStore", null, { root: true }).catch(() => {});
      dispatch("settings/reset", null, { root: true }).catch(() => {});
      dispatch("dataDelete/reset", null, { root: true }).catch(() => {});
      dispatch("breaches/reset", null, { root: true }).catch(() => {});
      dispatch("esim/reset", null, { root: true }).catch(() => {});
      dispatch("resetFeaturesStore", null, { root: true }).catch(() => {});
      dispatch("resetWaitlistStore", null, { root: true }).catch(() => {});
      dispatch("callGuard/reset", null, { root: true }).catch(() => {});
      dispatch("navigation/reset", null, { root: true }).catch(() => {});
      // NOTE: do not need to reset errors store because it is not user specific
      // Reset root state last
      commit("logout");
    },
    async init({ dispatch }) {
      dispatch("accountsImporter/watchImportStatus");
      extensionMessaging.readyToListen();
    },
    setSearch({ commit }, showSearch) {
      commit("setSearch", showSearch);
      commit("setBodyOverflow", showSearch);
    },
    deleteCloakFromLocalDB({ commit, dispatch }, idsForDelete) {
      let cloakIds = idsForDelete;
      if (typeof cloakId === "string" || typeof cloakId === "number") {
        cloakIds = [idsForDelete];
      }
      dispatch("removeCloaks", cloakIds);
      commit("setCloseRightPanel");
    },
    setVerifiedPhones({ commit }, phones) {
      commit("setVerifiedPhones", phones);
    },
    openCloakCreate({ commit }) {
      commit("openCloakCreate");
    },

    async updateCloaks({ dispatch, state }, cloaks) {
      const formattedCloaks = await dispatch("updateCloaksAndFormat", {
        cloaks,
        userId: state.authentication?.user?.id,
      });
      return formattedCloaks;
    },
  },
  modules: {
    rightPanel,
    modal,
    subscription,
    cards,
    media,
    reuse,
    getStarted,
    accountsImporter,
    recentlyImported,
    authentication,
    localdb,
    settings,
    browser,
    inbox,
    navigation,
    dataDelete,
    breaches,
    esim,
    waitlist,
    callGuard,
    features,
    cloakedPayOnboarding,
    errors,
  },
  plugins: [
    createPersistedState({
      key: "vuex",
      paths: ["account", "ui.user", "encryption", "authentication"],
      getState: (key) => {
        return JSON.parse(localStorage.getItem(key));
      },
      setState: (key, state) => {
        if (!state.locked) {
          const capture = localStorage.setItem(key, JSON.stringify(state));
          window.dispatchEvent(new Event("storage:write"));
          return capture;
        }
      },
    }),
  ],
});
