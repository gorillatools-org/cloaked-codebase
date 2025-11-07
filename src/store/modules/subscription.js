import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "@/composables/useToast.js";
import { authDecrypt } from "@/scripts/actions/encryption";
import SubscriptionService from "@/api/settings/subscription-services";
import { usePlansModal } from "@/features/subscribe/composables/usePlansModal";
const toast = useToast();

let initPromise = null;

const { openPlansModal } = usePlansModal();

const defaultState = () => ({
  stripe: null,
  plans: [],
  payPlans: [],
  invitations: [],
  subscriptionDetails: null,
});

export default {
  namespaced: true,
  state: defaultState(),
  mutations: {
    SET_STRIPE: (state, payload) => (state.stripe = payload),
    SET_PLANS: (state, payload) => (state.plans = payload),
    SET_PAY_PLANS: (state, payload) => (state.payPlans = payload),
    SET_INVITATIONS: (state, payload) => (state.invitations = payload),
    SET_SUBSCRIPTION_DETAILS: (state, payload) =>
      (state.subscriptionDetails = payload),
    reset(state) {
      Object.assign(state, defaultState());
      initPromise = null;
    },
  },
  actions: {
    reset({ commit }) {
      commit("reset");
    },
    async loadStripe({ commit }) {
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE);
      commit("SET_STRIPE", stripe);
      return stripe;
    },
    async fetchPlans({ commit }, type = null) {
      const plans = await SubscriptionService.getSubscriptionPlans(type);
      commit("SET_PLANS", plans);
      return plans;
    },
    async fetchCloakedPayPlans({ commit }) {
      const plans = await SubscriptionService.getCloakedPaySubscriptionPlans();
      commit("SET_PAY_PLANS", plans);
      return plans;
    },
    async fetchInvitations({ commit }) {
      const { results: invitations } =
        await SubscriptionService.getPlanInvitations();

      const decryptedInvitations = await Promise.all(
        invitations.map(async (encryptedInvite) => {
          let inviteeEmail = await authDecrypt(encryptedInvite.recipient_email);
          if (inviteeEmail === "FAILED TO DECRYPT") {
            inviteeEmail = encryptedInvite.recipient_email;
          }
          return {
            ...encryptedInvite,
            recipient_email: inviteeEmail,
          };
        })
      );

      commit("SET_INVITATIONS", decryptedInvitations);
      return invitations;
    },
    async sendInvite({ dispatch }, email) {
      await SubscriptionService.invitePlanMember(email);
      await dispatch("fetchInvitations");
    },
    async removeMember({ dispatch }, id) {
      await SubscriptionService.removePlanMember(id);
      await dispatch("fetchInvitations");
    },
    async acceptInvite(context, payload) {
      await SubscriptionService.acceptInvitation(payload);
      await SubscriptionService.getSubscription();
    },
    async cancelSubscription() {
      await SubscriptionService.removeSubscription();
      await SubscriptionService.getSubscription();
      await SubscriptionService.getSubscriptionDetails();
    },
    restoreSubscription({ dispatch }) {
      SubscriptionService.getSubscription();
      dispatch("fetchPlans");
      dispatch("fetchInvitations");
    },
    async cancelSubscriptionRenewal() {
      await SubscriptionService.cancelSubscription();
      await SubscriptionService.getSubscription();

      setTimeout(() => {
        const url = "https://keepitcloaked.typeform.com/to/UwV968cM";
        window.open(url, "_system");
      }, 2000);
    },
    async fetchSubscriptionDetails({ commit }) {
      let result = null;

      try {
        result = await SubscriptionService.getSubscriptionDetails().catch(
          () => {}
        );
      } finally {
        commit("SET_SUBSCRIPTION_DETAILS", result);
      }

      return result;
    },
    async init({ dispatch }) {
      await dispatch("authentication/waitForAuthentication", null, {
        root: true,
      });

      initPromise =
        initPromise ??
        Promise.all([
          dispatch("loadStripe"),
          dispatch("fetchPlans"),
          dispatch("fetchCloakedPayPlans"),
          dispatch("fetchInvitations"),
        ]);

      return initPromise;
    },
    // eslint-disable-next-line no-empty-pattern
    openSubscriptionModal({}, allowClose = true) {
      openPlansModal(allowClose);
    },
    awaitSubscriptionChange({ rootGetters }) {
      return new Promise((resolve, reject) => {
        let pollingInterval = null;
        let count = 0;

        pollingInterval = setInterval(() => {
          const oldProductId =
            rootGetters["settings/getSubscription"]?.product_identifier;
          const oldSubscriptionState =
            rootGetters["settings/getSubscription"]?.state;

          SubscriptionService.getSubscription()
            .then((newSubscription) => {
              const newProductId = newSubscription?.product_identifier;
              const newSubscriptionState = newSubscription?.state;

              if (
                rootGetters["settings/isSubscribed"] &&
                (newProductId !== oldProductId ||
                  newSubscriptionState !== oldSubscriptionState)
              ) {
                clearInterval(pollingInterval);
                resolve();
              } else {
                count++;

                if (count === 10) {
                  toast.success(
                    "Still fetching your subscription status, please hold..."
                  );
                } else if (count >= 60) {
                  clearInterval(pollingInterval);
                  toast.error(
                    "There was an error fetching your subscription status. Please try refreshing the page."
                  );
                  reject(
                    new Error("Subscription status not updated after 1 minute")
                  );
                }
              }
            })
            .catch(() => {
              count++;

              if (count >= 60) {
                clearInterval(pollingInterval);
                toast.error(
                  "There was an error fetching your subscription status. Please try refreshing the page."
                );
                reject(
                  new Error(
                    "Failed to fetch subscription status after 60 attempts"
                  )
                );
              }
            });
        }, 1000);
      });
    },
  },
  getters: {
    getStripe: (state) => state.stripe,
    getPlans: (state) => state.plans,
    getPayPlans: (state) => state.payPlans,
    getInvitations: (state) => state.invitations,
    getSubscriptionDetails: (state) => state.subscriptionDetails,
  },
};
