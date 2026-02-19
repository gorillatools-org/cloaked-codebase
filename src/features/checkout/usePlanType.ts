import { computed, type MaybeRefOrGetter } from "vue";
import { toValue } from "@vueuse/core";
import { getPlanType } from "@/features/checkout/utils.ts";
import type { Plan, PlanType } from "@/features/subscribe/types.ts";

// TODO: merge with the other plan type composable in a separate refactoring PR
export const usePlanType = (plan: MaybeRefOrGetter<Plan | null>) =>
  computed<PlanType | null>(() => {
    const planValue = toValue(plan);

    if (!planValue) {
      return null;
    }

    return getPlanType(planValue);
  });
