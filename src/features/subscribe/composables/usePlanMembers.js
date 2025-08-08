import { computed } from "vue";
import { toValue } from "@vueuse/core/index";

export const usePlanMembers = (plan) =>
  computed(() => {
    if (!toValue(plan)) {
      return null;
    }

    return toValue(plan).max_members === 1
      ? `${toValue(plan).max_members} member`
      : `${toValue(plan).max_members} members`;
  });
