import { computed } from "vue";
import { toValue } from "@vueuse/core/index";

export const usePlanType = (plan) =>
  computed(() => {
    if (!toValue(plan)) {
      return null;
    }

    return toValue(plan).max_members === 1
      ? "Individual"
      : toValue(plan).max_members === 2
        ? "Couple"
        : "Family";
  });
