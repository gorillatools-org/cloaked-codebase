import { computed } from "vue";
import { toValue } from "@vueuse/core/index";

export const usePlanBilling = (plan) =>
  computed(() => {
    if (!toValue(plan)) {
      return null;
    }

    return toValue(plan).recurring_interval === "2-yearly"
      ? "2-Yearly"
      : toValue(plan).recurring_interval === "annually"
        ? "Yearly"
        : "Monthly";
  });
