import { computed, toRef, toValue, type Ref } from "vue";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.ts";
import { findMostExpensivePlan } from "@/features/subscribe/composables/usePlanComparisonPrice.ts";
import type { Plan } from "@/features/subscribe/types.ts";

/**
 * Returns the per-member monthly price of the most expensive plan.
 * Used as a reference point to show savings when comparing plan prices.
 */
export const useCompareAtPrice = (plans: Ref<Plan[]>) => {
  const mostExpensivePlan = computed(
    () =>
      findMostExpensivePlan(toValue(plans), "monthly") ??
      findMostExpensivePlan(toValue(plans), "annually") ??
      findMostExpensivePlan(toValue(plans), "2-yearly")
  );

  return usePlanPrice(
    toRef(() => mostExpensivePlan.value),
    "per-member-monthly"
  );
};
