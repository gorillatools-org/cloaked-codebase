<script setup lang="ts">
import PaypalLogo from "@/assets/icons/paypal-logo.svg";

type PaymentMethodOption = {
  value: string;
  label: string;
};

type MCheckoutPaymentMethodSelectorProps = {
  options: PaymentMethodOption[];
  disabled?: boolean;
};

withDefaults(defineProps<MCheckoutPaymentMethodSelectorProps>(), {
  disabled: false,
});

const model = defineModel<string>();
</script>

<template>
  <div class="mobile-payment-method-selector">
    <label
      v-for="option in options"
      :key="option.value"
      class="mobile-payment-method-selector__option"
      :class="{
        'mobile-payment-method-selector__option--selected':
          model === option.value,
        'mobile-payment-method-selector__option--disabled': disabled,
      }"
    >
      <input
        v-model="model"
        type="radio"
        class="mobile-payment-method-selector__input"
        :value="option.value"
        :disabled="disabled"
      />
      <span class="mobile-payment-method-selector__radio">
        <span class="mobile-payment-method-selector__radio-dot" />
      </span>
      <PaypalLogo
        v-if="option.value === 'paypal'"
        class="mobile-payment-method-selector__paypal-logo"
      />
      <span
        v-else
        class="mobile-payment-method-selector__label"
      >
        {{ option.label }}
      </span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.mobile-payment-method-selector {
  display: flex;
  gap: 16px;
  align-items: center;

  &__option {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    user-select: none;

    &--disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__input {
    display: none;
  }

  &__radio {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid $color-neutral-400;
    flex-shrink: 0;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    .mobile-payment-method-selector__option--selected & {
      border-color: $color-neutral-1000;
    }
  }

  &__radio-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: $color-neutral-1000;
    opacity: 0;
    transform: scale(0);
    transition:
      opacity 0.15s ease,
      transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

    .mobile-payment-method-selector__option--selected & {
      opacity: 1;
      transform: scale(1);
    }
  }

  &__label {
    font-size: 17px;
    line-height: 22px;
    letter-spacing: -0.43px;
    color: $color-neutral-1000;
  }

  &__paypal-logo {
    height: 20px;
    width: auto;
    color: $color-neutral-1000;
  }
}
</style>
