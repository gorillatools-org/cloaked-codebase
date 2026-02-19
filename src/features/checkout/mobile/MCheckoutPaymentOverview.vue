<script setup lang="ts">
import { computed, inject, toRef } from "vue";
import BaseText from "@/library/BaseText.vue";
import {
  formattedPrice,
  isValidPrice,
} from "@/features/subscribe/composables/utils.ts";
import { useSelectedPlan } from "@/features/checkout/useSelectedPlan.ts";
import { useCheckoutPricing } from "@/features/checkout/useCheckoutPricing.ts";
import { usePlanType } from "@/features/checkout/usePlanType.ts";
import {
  checkoutSessionInjectionKey,
  countdownDiscountInjectionKey,
  couponDiscountInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { Plan } from "@/features/subscribe/types.ts";

type MCheckoutPaymentOverviewProps = {
  plans: Plan[];
};

const props = withDefaults(defineProps<MCheckoutPaymentOverviewProps>(), {
  plans: () => [],
});

const checkoutSession = inject(checkoutSessionInjectionKey);
const countdownDiscount = inject(countdownDiscountInjectionKey);
const couponDiscount = inject(couponDiscountInjectionKey);

const selectedPlan = useSelectedPlan(
  toRef(() => props.plans),
  checkoutSession
);

const { price, anchoredPrice, discountedPrice } = useCheckoutPricing({
  plans: toRef(() => props.plans),
  checkoutSession,
  countdownDiscount,
  couponDiscount,
});

const planType = usePlanType(selectedPlan);

/**
 * Plan title line — e.g. "Couple Annual Plan (Billed Yearly)"
 */
const planTitle = computed(() => {
  const plan = selectedPlan.value;

  if (!plan) {
    return null;
  }

  const typeLabel =
    planType.value === "couple"
      ? "Couple"
      : planType.value === "family"
        ? "Family"
        : "Individual";

  const billedLabel =
    plan.recurring_interval === "annually"
      ? "Billed Yearly"
      : plan.recurring_interval === "2-yearly"
        ? "Billed Every 2 Years"
        : "Billed Monthly";

  return `${typeLabel} Plan (${billedLabel})`;
});

const subtotal = computed(() => {
  if (isValidPrice(anchoredPrice)) {
    return anchoredPrice.value;
  }

  return price.value;
});

/**
 * New member discount - the amount saved from the countdown/anchor discount.
 */
const newMemberDiscount = computed(() => {
  if (!isValidPrice(anchoredPrice) || !isValidPrice(price)) {
    return null;
  }

  const savings = anchoredPrice.value - price.value;
  return savings > 0 ? savings : null;
});

/**
 * Coupon savings - the amount saved from a coupon code.
 */
const couponSavings = computed(() => {
  if (!isValidPrice(discountedPrice) || !isValidPrice(price)) {
    return null;
  }

  const savings = price.value - discountedPrice.value;
  return savings > 0 ? savings : null;
});

/**
 * The final "Total due today" value - after all discounts.
 */
const totalDueToday = computed(() => {
  if (isValidPrice(discountedPrice)) {
    return discountedPrice.value;
  }

  return price.value;
});

/**
 * Whether to show a strikethrough on the total line -
 * shown when the total is lower than the subtotal.
 */
const showStrikethroughTotal = computed(() => {
  if (!subtotal.value || !totalDueToday.value) {
    return false;
  }

  return totalDueToday.value < subtotal.value;
});
</script>

<template>
  <div
    v-if="selectedPlan"
    class="mobile-payment-overview"
  >
    <div class="mobile-payment-overview__divider" />

    <div class="mobile-payment-overview__items">
      <div class="mobile-payment-overview__row">
        <BaseText
          variant="subhead-emphasized"
          class="mobile-payment-overview__row-label mobile-payment-overview__row-label--bold"
        >
          {{ planTitle }}
        </BaseText>
      </div>

      <div class="mobile-payment-overview__row">
        <BaseText
          variant="subhead-regular"
          class="mobile-payment-overview__row-label"
        >
          Subtotal
        </BaseText>
        <BaseText variant="subhead-regular">
          {{ formattedPrice(subtotal) }}
        </BaseText>
      </div>

      <div
        v-if="newMemberDiscount"
        class="mobile-payment-overview__row"
      >
        <BaseText
          variant="subhead-regular"
          class="mobile-payment-overview__row-label"
        >
          New member discount
        </BaseText>
        <BaseText
          variant="subhead-regular"
          class="mobile-payment-overview__row-value--savings"
        >
          -{{ formattedPrice(newMemberDiscount) }}
        </BaseText>
      </div>

      <div
        v-if="couponSavings"
        class="mobile-payment-overview__row"
      >
        <BaseText
          variant="subhead-regular"
          class="mobile-payment-overview__row-label"
        >
          Promo code discount
        </BaseText>
        <BaseText
          variant="subhead-regular"
          class="mobile-payment-overview__row-value--savings"
        >
          -{{ formattedPrice(couponSavings) }}
        </BaseText>
      </div>
    </div>

    <div class="mobile-payment-overview__divider" />

    <div class="mobile-payment-overview__total">
      <div class="mobile-payment-overview__total-label">
        <BaseText variant="callout-emphasized">Total due today</BaseText>
      </div>
      <div class="mobile-payment-overview__total-amount">
        <BaseText
          v-if="showStrikethroughTotal"
          variant="subhead-regular"
          class="mobile-payment-overview__total-original"
        >
          {{ formattedPrice(subtotal) }}
        </BaseText>
        <BaseText variant="callout-emphasized">
          {{ formattedPrice(totalDueToday) }}
        </BaseText>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mobile-payment-overview {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__divider {
    height: 1px;
    background-color: $color-overlay-neutral-10;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  &__row-label {
    flex: 1;
    min-width: 0;
    color: $color-neutral-500;

    &--bold {
      color: $color-neutral-1000;
    }
  }

  &__row-value {
    &--savings {
      color: $color-success;
    }
  }

  &__total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  &__total-label {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__total-amount {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  &__total-original {
    text-decoration: line-through;
    color: $color-neutral-400;
  }
}
</style>
