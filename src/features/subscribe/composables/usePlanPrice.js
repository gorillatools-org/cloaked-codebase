import { computed } from "vue";
import { toValue } from "@vueuse/core";
import { roundedPrice } from "@/features/subscribe/composables/utils.js";

export const usePlanPrice = (plan, as) => {
  const price = computed(() => {
    if (!toValue(plan)) {
      return null;
    }

    return roundedPrice(toValue(plan).price / 100);
  });

  const monthlyPrice = computed(() => {
    if (!toValue(plan)) {
      return null;
    }

    return roundedPrice(
      toValue(plan).recurring_interval === "2-yearly"
        ? toValue(price) / 24
        : toValue(plan).recurring_interval === "annually"
          ? toValue(price) / 12
          : toValue(price)
    );
  });

  const perMemberPrice = computed(() => {
    if (!toValue(plan)) {
      return null;
    }

    return roundedPrice(toValue(price) / toValue(plan).max_members);
  });

  const perMemberMonthlyPrice = computed(() => {
    if (!toValue(plan)) {
      return null;
    }

    return roundedPrice(toValue(monthlyPrice) / toValue(plan).max_members);
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
