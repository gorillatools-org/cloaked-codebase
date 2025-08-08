import { usePlans } from "@/features/subscribe/composables/usePlans.js";
import { computed } from "vue";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.js";

export const usePlanComparisonPrice = () => {
  const { allPlans } = usePlans();

  // assuming individual monthly is the most expensive option
  const planToCompareAgainst = computed(() =>
    allPlans.value.find(
      (plan) => plan.max_members === 1 && plan.recurring_interval === "monthly"
    )
  );

  return usePlanPrice(planToCompareAgainst, "per-member-monthly");
};
