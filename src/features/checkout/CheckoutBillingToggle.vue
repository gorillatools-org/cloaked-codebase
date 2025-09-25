<script setup lang="ts">
import { watch } from "vue";
import BaseText from "@/library/BaseText.vue";
import type { TierBilling } from "@/features/subscribe/types.ts";
import { posthogCapture } from "@/scripts/posthog";

type BillingOption = {
  value: TierBilling;
  label: string;
};

const billingOptions: BillingOption[] = [
  { value: "yearly", label: "Annual" },
  { value: "monthly", label: "Monthly" },
];

const model = defineModel<TierBilling>();

watch(model, (billing) => {
  posthogCapture("tier_checkout_billing_frequency_toggled", { billing });
});
</script>

<template>
  <div class="checkout-toggle">
    <label
      v-for="option in billingOptions"
      :key="option.value"
      class="checkout-toggle__label"
    >
      <input
        v-model="model"
        type="radio"
        name="checkout-toggle"
        class="checkout-toggle__input"
        :value="option.value"
      />
      <BaseText variant="body-3-semibold">
        {{ option.label }}
      </BaseText>
    </label>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.checkout-toggle {
  display: inline-flex;
  cursor: pointer;
  background-color: $color-primary-10;
  border-radius: 100px;
  width: 100%;
  max-width: 360px;

  &__label {
    padding: 10px 0;
    cursor: pointer;
    color: $color-primary-70;
    border-radius: 100px;
    border: 1px solid $color-primary-10;
    text-align: center;
    flex: 1;

    &:has(.checkout-toggle__input:checked) {
      background-color: $color-base-white-100;
      border-radius: 100px;
      color: $color-primary-100;
      border: 1px solid $color-base-black-15;
      box-shadow: 0 4px 24px 0 rgba($black, 0.05);
    }
  }

  &__input {
    display: none;
  }
}
</style>
