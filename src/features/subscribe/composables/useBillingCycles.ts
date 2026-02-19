import { usePlans } from "@/features/subscribe/composables/usePlans";
import { computed } from "vue";
import type { PlanBilling } from "@/features/subscribe/types.ts";

export const billingCycleToMonths: Record<PlanBilling, number> = {
  "2-yearly": 24,
  annually: 12,
  monthly: 1,
};

export const useBillingCycles = () => {
  const { allPlans } = usePlans();

  return computed(() =>
    Array.from(
      new Set(allPlans.value.map((plan) => plan.recurring_interval))
    ).sort((a, b) => billingCycleToMonths[b] - billingCycleToMonths[a])
  );
};
