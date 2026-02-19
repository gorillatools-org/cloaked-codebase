<script setup lang="ts">
import { inject, toRef } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import {
  checkoutSessionInjectionKey,
  countdownDiscountInjectionKey,
  couponDiscountInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { Plan } from "@/features/subscribe/types.ts";
import { usePlanType } from "@/features/checkout/usePlanType.ts";
import { usePlanBilling } from "@/features/subscribe/composables/usePlanBilling.ts";
import { usePlanMembers } from "@/features/subscribe/composables/usePlanMembers.ts";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.ts";
import { usePriceAnchor } from "@/features/subscribe/composables/usePriceAnchor.ts";
import { usePriceDiscount } from "@/features/subscribe/composables/usePriceDiscount.ts";
import { useSavings } from "@/features/subscribe/composables/useSavings.ts";
import {
  formattedPrice,
  isValidPrice,
} from "@/features/subscribe/composables/utils.ts";

type CheckoutPlanCardProps = {
  plan: Plan;
  compareAt?: number | null;
  disabled?: boolean;
};

const props = withDefaults(defineProps<CheckoutPlanCardProps>(), {
  compareAt: null,
  disabled: false,
});

const checkoutSession = inject(checkoutSessionInjectionKey);
const countdownDiscount = inject(countdownDiscountInjectionKey);
const couponDiscount = inject(couponDiscountInjectionKey);

const plan = toRef(() => props.plan);
const anchor = toRef(() => countdownDiscount?.discount.value ?? null);
const discount = toRef(() =>
  checkoutSession?.method === "stripe"
    ? (couponDiscount?.discount.value ?? null)
    : null
);

const type = usePlanType(plan);
const billing = usePlanBilling(plan);
const members = usePlanMembers(plan);

const price = usePlanPrice(plan, "per-member-monthly");
const anchoredPrice = usePriceAnchor(price, anchor);
const discountedPrice = usePriceDiscount(price, discount);

const compareAtPrice = toRef(() => props.compareAt);
const savings = useSavings(price, compareAtPrice);
</script>

<template>
  <label class="checkout-plan">
    <BaseSheet
      spacing-y="sm"
      spacing-x="sm"
      elevation="none"
      class="checkout-plan__card"
    >
      <div class="checkout-plan__title">
        <BaseText
          variant="headline-4-bold"
          class="checkout-plan__type"
          as="h3"
        >
          {{ type }}
          {{ billing }}
        </BaseText>
        <BaseText
          variant="body-3-semibold"
          class="checkout-plan__members"
        >
          &nbsp;•&nbsp;
          {{ members }}
        </BaseText>
      </div>
      <BaseText
        variant="body-3-semibold"
        as="p"
      >
        <span
          v-if="isValidPrice(anchoredPrice)"
          class="checkout-plan__price--original"
        >
          {{ formattedPrice(anchoredPrice) }}
        </span>
        <span
          v-else-if="isValidPrice(discountedPrice)"
          class="checkout-plan__price--original"
        >
          {{ formattedPrice(price) }}
        </span>
        <template v-if="isValidPrice(discountedPrice)">
          {{
            `${formattedPrice(discountedPrice)}${type === "individual" ? "/per month" : "/member per month"}`
          }}
        </template>
        <template v-else>
          {{
            `${formattedPrice(price)}${type === "individual" ? "/per month" : "/member per month"}`
          }}
        </template>
      </BaseText>
      <BaseText
        v-if="savings && savings > 0"
        variant="body-3-semibold"
        as="p"
      >
        Save {{ savings }}%
        <template v-if="plan.recurring_interval === 'annually'">
          billed annually
        </template>
      </BaseText>
      <input
        v-if="checkoutSession"
        v-model="checkoutSession.plan"
        :value="type"
        :disabled="disabled"
        type="radio"
        class="checkout-plan__input"
      />
    </BaseSheet>
  </label>
</template>

<style lang="scss" scoped>
.checkout-plan {
  cursor: pointer;
  display: block;

  &:has(.checkout-plan__input:checked) {
    .checkout-plan__card {
      border: 1px solid $color-primary-100;
    }
  }

  &:has(.checkout-plan__input:disabled) {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &__title {
    display: flex;
    align-items: baseline;
  }

  &__type {
    text-transform: capitalize;
  }

  &__price {
    &--original {
      text-decoration: line-through;
      margin-right: 4px;
      opacity: 0.5;
    }
  }

  &__input {
    display: none;
  }
}
</style>
