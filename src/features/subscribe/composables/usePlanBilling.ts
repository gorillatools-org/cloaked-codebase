import { computed, type MaybeRefOrGetter } from "vue";
import { toValue } from "@vueuse/core";
import type { Plan } from "@/features/subscribe/types.ts";

export const usePlanBilling = (plan: MaybeRefOrGetter<Plan>) =>
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
