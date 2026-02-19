import { computed, type MaybeRefOrGetter } from "vue";
import { toValue } from "@vueuse/core";
import { getPlanType } from "@/features/checkout/utils.ts";
import type { Plan, PlanType } from "@/features/subscribe/types.ts";

// TODO: merge with the other plan type composable in a separate refactoring PR
export const usePlanType = (plan: MaybeRefOrGetter<Plan>) =>
  computed<PlanType | null>(() => {
    if (!toValue(plan)) {
      return null;
    }

    return getPlanType(toValue(plan));
  });
