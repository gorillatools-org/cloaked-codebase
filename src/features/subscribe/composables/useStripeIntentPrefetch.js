import { toValue } from "@vueuse/core/index";
import { useStripeIntent } from "@/features/subscribe/composables/useStripeIntent.js";
import { usePlans } from "@/features/subscribe/composables/usePlans";

const { allPlans } = usePlans();
const { getIntent } = useStripeIntent();

export const useStripeIntentPrefetch = () => {
  const prefetchIntents = () => {
    return toValue(allPlans)
      .filter((plan) => plan.provider === "stripe")
      .map((plan) => getIntent(plan.product_id));
  };

  return {
    prefetchIntents,
  };
};
