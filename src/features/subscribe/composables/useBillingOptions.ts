import { computed } from "vue";
import { toValue } from "@vueuse/core";
import { useBillingCycles } from "@/features/subscribe/composables/useBillingCycles.js";
import type { PlanBilling } from "@/features/subscribe/types.ts";

const billingCycleToLabel: Record<PlanBilling, string> = {
  "2-yearly": "2-Year",
  annually: "Annual",
  monthly: "Monthly",
};

export type BillingCycleOption = {
  id: PlanBilling;
  label: string;
};

const planCycles = useBillingCycles();

export const useBillingOptions = () =>
  computed<BillingCycleOption[]>(() =>
    toValue(planCycles).map((cycle) => ({
      id: cycle,
      label: billingCycleToLabel[cycle],
    }))
  );
