import { ref } from "vue";
import { toValue } from "@vueuse/core/index";
import SubscriptionService from "@/api/settings/subscription-services.js";

const intents = ref([]);
let intentRequests = [];

export const useStripeIntent = () => {
  const getCachedIntent = (planId, promoCode) =>
    toValue(intents).find(
      (intent) => intent.planId === planId && intent.promoCode === promoCode
    )?.intent ?? null;

  const setCachedIntent = (planId, promoCode, intent) => {
    intents.value = [
      ...toValue(intents).filter(
        (intent) => intent.planId !== planId || intent.promoCode !== promoCode
      ),
      {
        planId,
        promoCode,
        intent,
      },
    ];
  };

  const getCachedRequest = (planId, promoCode) =>
    intentRequests.find(
      (request) => request.planId === planId && request.promoCode === promoCode
    )?.request ?? null;

  const setCachedRequest = (planId, promoCode, request) => {
    intentRequests.push({
      planId,
      promoCode,
      request,
    });
  };

  const createIntent = (planId, promoCode) => {
    const cachedRequest = getCachedRequest(planId, promoCode);

    if (cachedRequest) {
      return cachedRequest;
    }

    const newRequest = SubscriptionService.getPaymentIntent(planId, promoCode);
    setCachedRequest(planId, promoCode, newRequest);

    return getCachedRequest(planId, promoCode);
  };

  const getIntent = async (planId, promoCode = null) => {
    const cachedIntent = getCachedIntent(planId, promoCode);

    if (cachedIntent) {
      return cachedIntent;
    }

    const newIntent = await createIntent(planId, promoCode);
    setCachedIntent(planId, promoCode, newIntent);

    return getCachedIntent(planId, promoCode);
  };

  const clearIntentCache = () => {
    intents.value = [];
    intentRequests = [];
  };

  return {
    getIntent,
    clearIntentCache,
  };
};
