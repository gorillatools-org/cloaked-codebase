import { computed, type MaybeRefOrGetter } from "vue";
import { toValue } from "@vueuse/core";
import type { Plan } from "@/features/subscribe/types.ts";

export const usePlanMembers = (plan: MaybeRefOrGetter<Plan>) =>
  computed(() => {
    if (!toValue(plan)) {
      return null;
    }

    return toValue(plan).max_members === 1
      ? `${toValue(plan).max_members} member`
      : `${toValue(plan).max_members} members`;
  });
