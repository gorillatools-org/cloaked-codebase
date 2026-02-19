<script setup lang="ts">
import { computed, inject, ref, useTemplateRef } from "vue";
import { watchImmediate } from "@vueuse/core";
import BaseText from "@/library/BaseText.vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseIcon from "@/library/BaseIcon.vue";
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
    <BaseInput
      ref="input"
      v-model="couponCode"
      title="Promo code"
      placeholder="Promo code"
      :disabled="
        couponDiscount?.isValidatingCoupon.value || !!checkoutSession?.status
      "
      :error="couponDiscount?.couponError.value"
      type="text"
      @click-action="isValid ? removePromoCode(true) : validatePromoCode(true)"
      @keydown.enter="validatePromoCode(true)"
      @keydown.esc="removePromoCode(true)"
    >
      <template #right>
        <span
          v-if="couponDiscount?.isValidatingCoupon.value"
          class="checkout-coupon-field__icon checkout-coupon-field__loader"
        />
        <BaseIcon
          v-else-if="couponCode"
          :name="isValid ? 'close' : 'arrow-right'"
          class="checkout-coupon-field__icon"
          @click="isValid ? removePromoCode(true) : validatePromoCode(true)"
        />
      </template>
    </BaseInput>
    <BaseText
      v-if="couponDiscount?.discount.value"
      variant="body-small-medium"
    >
      Coupon added ({{ couponDiscount?.discount }}% off)
    </BaseText>
  </div>
</template>

<style lang="scss" scoped>
.checkout-coupon-field {
  &__icon {
    cursor: pointer;
    opacity: 0.3;

    &:hover {
      opacity: 0.7;
    }
  }

  &__loader {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: linear-gradient(currentcolor 40%, transparent 70%);
    mask: radial-gradient(closest-side, transparent 70%, black 70%);
    animation: rotate 0.5s linear infinite;
    opacity: 0.3;
    cursor: not-allowed;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
