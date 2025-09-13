import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.js";
import type { Plan, PlanBilling } from "@/features/subscribe/types.ts";

const { allPlans } = usePlans();

// assuming plan with the least max_members is the most expensive
const findMostExpensivePlan = (plans: Plan[], billing: PlanBilling) =>
  plans
    .filter((plan) => plan.recurring_interval === billing)
    .reduce((min, current) =>
      min ? (current.max_members < min.max_members ? current : min) : current
    );

export const usePlanComparisonPrice = (
  plans: MaybeRefOrGetter<Plan[]> = allPlans
) => {
  const planToCompareAgainst = computed(() => {
    const plansToCompareAgainst = toValue(plans);
    return (
      findMostExpensivePlan(plansToCompareAgainst, "monthly") ??
      findMostExpensivePlan(plansToCompareAgainst, "annually") ??
      findMostExpensivePlan(plansToCompareAgainst, "2-yearly")
    );
  });

  return usePlanPrice(planToCompareAgainst, "per-member-monthly");
};
