<script setup lang="ts">
import { computed, inject, watch } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import {
  checkoutSessionInjectionKey,
  countdownDiscountInjectionKey,
} from "@/features/checkout/injectionKeys.ts";

const countdownDiscount = inject(countdownDiscountInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);

const status = computed(() => checkoutSession?.status ?? null);

const formattedCountdown = computed(() => {
  const remaining = countdownDiscount?.countdown.value;

  if (!remaining) {
    return;
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  if (remaining % 60 === 0 && minutes === 1) {
    return `${remaining} second${remaining !== 1 ? "s" : ""}`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
});

const formattedBillingCycle = computed(() => {
  return checkoutSession?.billing === "annually"
    ? "annual"
    : checkoutSession?.billing;
});

watch(status, (newStatus) =>
  newStatus ? countdownDiscount?.pause() : countdownDiscount?.resume()
);
</script>

<template>
  <BaseSheet
    v-if="countdownDiscount?.discount?.value && !checkoutSession?.isPaid"
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    rounding="sm"
    class="checkout-card-discount"
    :class="{
      'checkout-card-discount--paused': !countdownDiscount?.isActive?.value,
    }"
  >
    <BaseText
      as="p"
      variant="body-2-semibold"
      class="checkout-card-discount__text"
    >
      Purchase in
      <span class="checkout-card-discount__countdown">
        {{ formattedCountdown }}
      </span>
      <br />
      to save {{ countdownDiscount.discount }}% off your
      {{ formattedBillingCycle }} subscription!
    </BaseText>
  </BaseSheet>
</template>

<style lang="scss" scoped>
.checkout-card-discount {
  background: transparent;
  align-content: center;
  border: 2px solid $color-success;

  &__text {
    text-align: center;
    line-height: 160%;
  }

  &__countdown {
    color: $color-success;
  }

  &--paused {
    border: 2px solid $color-base-black-20;

    .checkout-card-discount__countdown {
      color: $color-base-black-50;
    }
  }
}
</style>
