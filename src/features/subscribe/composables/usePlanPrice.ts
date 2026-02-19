import { computed, type MaybeRefOrGetter } from "vue";
import { toValue } from "@vueuse/core";
import { roundedPrice } from "@/features/subscribe/composables/utils.ts";
import { billingCycleToMonths } from "@/features/subscribe/composables/useBillingCycles.js";
import type { Plan } from "@/features/subscribe/types.ts";

export type PlanPriceAs = "monthly" | "per-member" | "per-member-monthly";

export const usePlanPrice = (
  plan: MaybeRefOrGetter<Plan | null>,
  as?: PlanPriceAs,
  field: "price" | "default_price" = "price"
) => {
  const price = computed(() => {
    const planValue = toValue(plan);
    if (!planValue) {
      return null;
    }

    const price = field === "price" ? planValue.price : planValue.default_price;
    if (price === null) return null;

    return roundedPrice(price / 100);
  });

  const monthlyPrice = computed(() => {
    const planValue = toValue(plan);
    const priceValue = toValue(price);

    if (!planValue || !priceValue) {
      return null;
    }

    return roundedPrice(
      priceValue / billingCycleToMonths[planValue.recurring_interval]
    );
  });

  const perMemberPrice = computed(() => {
    const planValue = toValue(plan);
    const priceValue = toValue(price);

    if (!planValue || !priceValue) {
      return null;
    }

    return roundedPrice(priceValue / planValue.max_members);
  });

  const perMemberMonthlyPrice = computed(() => {
    const planValue = toValue(plan);
    const priceValue = toValue(monthlyPrice);

    if (!planValue || !priceValue) {
      return null;
    }

    return roundedPrice(priceValue / planValue.max_members);
  });

  return computed(() => {
    if (as === "monthly") {
      return toValue(monthlyPrice);
    }

    if (as === "per-member") {
      return toValue(perMemberPrice);
    }

    if (as === "per-member-monthly") {
      return toValue(perMemberMonthlyPrice);
    }

    return toValue(price);
  });
};
