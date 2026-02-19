import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.js";
import type {
  Plan,
  PlanBilling,
  PlanProduct,
} from "@/features/subscribe/types.ts";

// assuming plan with the least max_members is the most expensive
export const findMostExpensivePlan = (plans: Plan[], billing: PlanBilling) =>
  plans
    .filter((plan) => plan.recurring_interval === billing)
    .reduce((min, current) =>
      min ? (current.max_members < min.max_members ? current : min) : current
    );

export const usePlanComparisonPrice = (
  plans?: MaybeRefOrGetter<Plan[]>,
  planProduct: MaybeRefOrGetter<PlanProduct> = "all"
) => {
  const { allPlans } = usePlans(planProduct);

  const planToCompareAgainst = computed(() => {
    const plansToCompareAgainst = toValue(plans ?? allPlans);
    return (
      findMostExpensivePlan(plansToCompareAgainst, "monthly") ??
      findMostExpensivePlan(plansToCompareAgainst, "annually") ??
      findMostExpensivePlan(plansToCompareAgainst, "2-yearly")
    );
  });

  return usePlanPrice(planToCompareAgainst, "per-member-monthly");
};
