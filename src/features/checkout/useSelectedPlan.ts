import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { Plan } from "@/features/subscribe/types.ts";
import type { CheckoutSession } from "@/features/checkout/useCheckoutSession.ts";
import { getPlanType } from "@/features/checkout/utils.ts";

export const useSelectedPlan = (
  plans: MaybeRefOrGetter<Plan[]>,
  session?: CheckoutSession
) =>
  computed(() => {
    if (!session) {
      return null;
    }

    return (
      toValue(plans).find(
        (plan) =>
          plan.provider === session.method &&
          plan.recurring_interval === session.billing &&
          getPlanType(plan) === session.plan
      ) ?? null
    );
  });
