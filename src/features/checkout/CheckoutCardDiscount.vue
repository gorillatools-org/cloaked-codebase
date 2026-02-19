<script setup lang="ts">
import { computed, inject } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import { countdownDiscountInjectionKey } from "@/features/checkout/injectionKeys.ts";

const countdownDiscount = inject(countdownDiscountInjectionKey);

const formattedCountdown = computed(() => {
  const remaining = countdownDiscount?.countdown.value;

  if (!remaining) {
    return;
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  if (minutes > 0 && seconds > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
});
</script>

<template>
  <BaseSheet
    v-if="countdownDiscount?.discount.value"
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    class="checkout-card-discount"
  >
    <BaseText
      as="p"
      variant="body-2-semibold"
    >
      Purchase in
      {{ formattedCountdown }}
      to save {{ countdownDiscount.discount }}% off your subscription!
    </BaseText>
  </BaseSheet>
</template>

<style lang="scss" scoped>
.checkout-card-discount {
  opacity: 1;
}
</style>
