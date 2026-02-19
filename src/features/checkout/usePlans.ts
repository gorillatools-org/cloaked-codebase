import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { Plan } from "@/features/subscribe/types.ts";

export const usePlans = (plans: MaybeRefOrGetter<Plan[]>) => {
  const stripePlans = computed(
    () => toValue(plans)?.filter((plan) => plan.provider === "stripe") ?? []
  );

  const paypalPlans = computed(
    () => toValue(plans)?.filter((plan) => plan.provider === "paypal") ?? []
  );

  return {
    stripePlans,
    paypalPlans,
  };
};
