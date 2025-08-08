import { computed, ref, watch } from "vue";
import { toValue } from "@vueuse/core";

const billingCycleToLabel = {
  "2-yearly": "2-Year",
  annually: "Annual",
  monthly: "Monthly",
};

export const useBillingCycle = (plans = []) => {
  const selectedBillingCycle = ref("annually");

  const planCycles = computed(() =>
    Array.from(
      new Set(toValue(plans).map((plan) => plan.recurring_interval))
    ).sort((a, b) => (a < b ? -1 : 1))
  );

  watch(planCycles, (newValue) => {
    selectedBillingCycle.value = newValue[0];
  });

  const allBillingCycles = computed(() =>
    toValue(planCycles).map((cycle) => ({
      id: cycle,
      label: billingCycleToLabel[cycle],
    }))
  );

  return {
    allBillingCycles,
    selectedBillingCycle,
  };
};
