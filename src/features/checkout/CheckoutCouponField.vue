<script setup lang="ts">
import { computed, inject, ref, useTemplateRef } from "vue";
import { watchImmediate } from "@vueuse/core";
import BaseText from "@/library/BaseText.vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import Button from "@/features/Button.vue";
import {
  couponDiscountInjectionKey,
  checkoutSessionInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { Plan } from "@/features/subscribe/types.ts";

type CheckoutCouponFieldProps = {
  plan: Plan | null;
};

const props = defineProps<CheckoutCouponFieldProps>();

const couponDiscount = inject(couponDiscountInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);

const couponCode = ref(checkoutSession?.coupon ?? "");
const input = useTemplateRef("input");

const validatePromoCode = async (focus = false) => {
  if (!couponDiscount || !props.plan || !couponCode.value) {
    return;
  }

  await couponDiscount.validateCoupon(props.plan.product_id, couponCode.value);
  focus && input.value?.focus();
};

const removePromoCode = (focus = false) => {
  if (!couponDiscount || !couponCode.value) {
    return;
  }

  couponCode.value = "";
  couponDiscount.coupon.value = null;
  couponDiscount.discount.value = null;
  focus && input.value?.focus();
};

const isValid = computed(() => {
  if (!couponDiscount) {
    return false;
  }

  return (
    !!couponDiscount.discount.value &&
    couponDiscount.coupon.value === couponCode.value
  );
});

watchImmediate(
  () => props.plan,
  () => {
    if (couponCode.value && checkoutSession?.method === "stripe") {
      validatePromoCode();
    }
  }
);
</script>

<template>
  <div class="checkout-coupon-field">
    <div
      class="checkout-coupon-field__row"
      :class="{
        'checkout-coupon-field__row--error': couponDiscount?.couponError.value,
      }"
    >
      <BaseInput
        ref="input"
        v-model="couponCode"
        class="checkout-coupon-field__input"
        title="Promo code"
        placeholder="Promo code"
        :disabled="
          couponDiscount?.isValidatingCoupon.value ||
          !!checkoutSession?.status ||
          isValid
        "
        :error="couponDiscount?.couponError.value"
        type="text"
        @keydown.enter="validatePromoCode(true)"
        @keydown.esc="removePromoCode(true)"
      >
        <template #right>
          <div
            class="checkout-coupon-field__icon-container"
            @click.stop="removePromoCode(true)"
          >
            <BaseIcon
              v-if="isValid && !checkoutSession?.status"
              name="close"
              class="checkout-coupon-field__icon"
            />
          </div>
        </template>
      </BaseInput>
      <Button
        v-if="!isValid && !checkoutSession?.status"
        class="checkout-coupon-field__button"
        type="primary"
        size="xl"
        :loading="couponDiscount?.isValidatingCoupon.value"
        :disabled="!couponCode || couponDiscount?.isValidatingCoupon.value"
        @click="validatePromoCode(true)"
      >
        Apply
      </Button>
    </div>
    <BaseText
      v-if="couponDiscount?.discount.value"
      variant="body-small-medium"
      class="checkout-coupon-field__success"
      as="p"
    >
      Coupon added ({{ couponDiscount?.discount }}% off)
    </BaseText>
  </div>
</template>

<style lang="scss" scoped>
.checkout-coupon-field {
  // On iOS WebKit, a disabled <input> inside a <label> swallows tap events,
  // preventing clicks from reaching overlapping elements like the remove icon.
  // pointer-events: none makes the disabled input transparent to touch/click.
  :deep(.base-input__input:disabled) {
    pointer-events: none;
  }

  &__icon-container {
    width: 30px;
    height: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    font-size: 20px;
    opacity: 1;

    .checkout-coupon-field__icon-container:hover & {
      opacity: 0.7;
    }
  }

  &__row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__input {
    flex: 1;
  }

  &__button {
    flex-shrink: 0;
    font-weight: 600;
    width: 110px;
    margin-top: 20px;

    .checkout-coupon-field__row--error & {
      margin-top: -20px;

      @media all and (min-width: $screen-sm) {
        margin-top: 0;
      }
    }

    &:disabled {
      background-color: $color-primary-20;
    }
  }

  &__success {
    margin-top: 4px;
    color: $color-success;
  }
}
</style>
