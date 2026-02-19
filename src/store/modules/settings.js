import { humanize } from "@/scripts/timestamp_format";
import { SUBSCRIPTION_STORES } from "@/scripts/constants";

const defaultState = () => ({
  prevRouteName: "All",
  personalEmails: [],
  personalPhones: [],
  subscription: null,
  limits: null,
  stripe: null,
  permissions: {},
});

export default {
  namespaced: true,
  state: defaultState(),

  mutations: {
    reset(state) {
      Object.assign(state, defaultState());
    },
    setPermissions: (state, permissions) => {
      state.permissions = permissions;
    },
    setPrevRouteName: (state, routeName) => {
      state.prevRouteName = routeName;
    },
    setPersonalEmails: (state, emails) => {
      state.personalEmails = emails;
    },
    addNewPersonalEmail: (state, email) => {
      state.personalEmails = [...state.personalEmails, email];
    },
    deletePersonalEmail: (state, data) => {
      const emailId = data?.id;
      const emailUrl = data?.url;
      state.personalEmails = [...state.personalEmails].filter((e) => {
        if (emailId) {
          return e.id !== emailId;
        }
        if (emailUrl) {
          return e.url !== emailUrl;
        }
      });
    },
    updatePersonalEmail: (state, email) => {
      state.personalEmails = [...state.personalEmails].map((e) => {
        if (e.id === email.id) {
          return email;
        }
        return e;
      });
    },

    setPersonalPhones: (state, phones) => {
      state.personalPhones = phones;
    },
    setSubscription(state, value) {
      state.subscription = value;
    },
    setStripe(state, value) {
      state.stripe = value;
    },
    setLimits(state, value) {
      state.limits = value;
    },
  },
  getters: {
    getPrevRouteName: (state) => {
      return state.prevRouteName;
    },
    getPersonalEmails: (state) => {
      return state.personalEmails;
    },
    getVerifiedEmails: (state) => {
      return state.personalEmails.filter((e) => e.verified);
    },
    getPersonalPhones: (state) => {
      return state.personalPhones;
    },
    getVerifiedPhones: (state) => {
      return state.personalPhones.filter((e) => e.verified);
    },
    getSubscription(state) {
      return state.subscription;
    },
    isSubscribed(state) {
      return state.subscription?.state === "PAID";
    },
    isCancelled(state) {
      return state.subscription?.state === "CANCELED";
    },
    isTrial(state) {
      return state.subscription?.state === "NEW";
    },
    isLegacy(state) {
      return state.subscription?.state === "UNKNOWN";
    },
    expiresIn(state) {
      if (state.subscription.expires_date) {
        return humanize(state.subscription.expires_date);
      }
      return "";
    },
    getStripe(state) {
      return state.stripe;
    },
    getLimits(state) {
      return state.limits;
    },
    getPhoneNumberRemaining(state) {
      const limits = state.limits;
      if (limits) {
        return limits.max_phone_numbers - limits.current_phone_usage;
      }
      return -1;
    },
    getStore(state) {
      return state.subscription?.store;
    },
    isStoreStripe(state) {
      return state.subscription?.store === SUBSCRIPTION_STORES.STRIPE;
    },
    isStoreAppStore(state) {
      return state.subscription?.store === SUBSCRIPTION_STORES.APP_STORE;
    },
    isStorePlayStore(state) {
      return state.subscription?.store === SUBSCRIPTION_STORES.PLAY_STORE;
    },
    isStoreManual(state) {
      //We added this new state to allow for paid users that we manually give upgrades to.
      return state.subscription?.store === SUBSCRIPTION_STORES.MANUAL_UPGRADE;
    },
    isStoreUnknown(state) {
      //New users always get this store.
      //Legacy users SOMETIMES have this store.
      //Data Deletion is what ever they paid with. (likely stripe or paypal)
      return state.subscription?.store === SUBSCRIPTION_STORES.UNKNOWN;
    },
    isStorePayPal(state) {
      return state.subscription?.store === SUBSCRIPTION_STORES.PAYPAL;
    },
    getPermissions: (state) => {
      return state.permissions;
    },
  },
  actions: {
    reset({ commit }) {
      commit("reset");
    },
    savePrevRouteName({ commit }, prevRouteName) {
      commit("setPrevRouteName", prevRouteName);
    },
    resetPrevRouteName({ commit }) {
      commit("setPrevRouteName", "All");
    },
    savePersonalEmails({ commit }, emails) {
      commit("setPersonalEmails", emails);
    },
    saveNewPersonalEmail({ commit }, email) {
      commit("addNewPersonalEmail", email);
    },
    updatePersonalEmail({ commit }, email) {
      commit("updatePersonalEmail", email);
    },
    deletePersonalEmail({ commit }, data) {
      // data = {url || id}
      commit("deletePersonalEmail", data);
    },
    savePersonalPhones({ commit }, phones) {
      commit("setPersonalPhones", phones);
    },
    saveSubscription({ commit }, subscription) {
      commit("setSubscription", subscription);
    },
    saveStripe({ commit }, stripeData) {
      commit("setStripe", stripeData);
    },
    saveLimits({ commit }, limitData) {
      commit("setLimits", limitData);
    },
    savePermissions({ commit }, profileData) {
      const permissions = {};
      Object.keys(profileData).forEach((key) => {
        if (key.startsWith("permission_")) {
          permissions[key] = profileData[key];
        }
      });
      commit("setPermissions", permissions);
    },
  },
};
