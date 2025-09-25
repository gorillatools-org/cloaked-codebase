import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { Tier, TierBilling } from "@/features/subscribe/types.ts";
import { roundedPrice } from "@/features/subscribe/composables/utils.ts";

export const useTierPrice = (
  tier: MaybeRefOrGetter<Tier | null>,
  billing: TierBilling,
  as: "per-year" | "per-month"
) => {
  const yearlyPerYear = computed(() => {
    const tierValue = toValue(tier);

    if (!tierValue) {
      return null;
    }

    return roundedPrice(tierValue.price.yearly / 100);
  });

  const yearlyPerMonth = computed(() => {
    const tierValue = toValue(tier);

    if (!tierValue) {
      return null;
    }

    return roundedPrice(tierValue.price.yearly / 12 / 100);
  });

  const monthlyPerMonth = computed(() => {
    const tierValue = toValue(tier);

    if (!tierValue) {
      return null;
    }

    return roundedPrice(tierValue.price.monthly / 100);
  });

  const monthlyPerYear = computed(() => {
    const tierValue = toValue(tier);

    if (!tierValue) {
      return null;
    }

    return roundedPrice((tierValue.price.monthly * 12) / 100);
  });

  return computed(() => {
    if (billing === "yearly" && as === "per-year") {
      return toValue(yearlyPerYear);
    }

    if (billing === "yearly" && as === "per-month") {
      return toValue(yearlyPerMonth);
    }

    if (billing === "monthly" && as === "per-year") {
      return toValue(monthlyPerYear);
    }

    if (billing === "monthly" && as === "per-month") {
      return toValue(monthlyPerMonth);
    }

    return toValue(yearlyPerYear);
  });
};
