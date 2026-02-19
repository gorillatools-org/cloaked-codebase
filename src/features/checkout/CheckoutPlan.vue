<script setup lang="ts">
import { inject, toRef } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseIcon from "@/library/BaseIcon.vue";
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
  compareAtPrice?: number | null;
  disabled?: boolean;
};

const props = withDefaults(defineProps<CheckoutPlanCardProps>(), {
  compareAtPrice: null,
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

const savings = useSavings(
  price,
  toRef(() => props.compareAtPrice)
);
</script>

<template>
  <label
    class="checkout-plan"
    :class="`checkout-plan--${type}`"
  >
    <BaseSheet
      spacing-y="sm"
      spacing-x="sm"
      elevation="none"
      rounding="sm"
      class="checkout-plan__card"
    >
      <div class="checkout-plan__icon">
        <BaseIcon name="check" />
      </div>
      <div class="checkout-plan__content">
        <div class="checkout-plan__title">
          <BaseText
            variant="headline-4-bold"
            class="checkout-plan__type"
            as="h3"
          >
            <template v-if="type !== 'individual'">
              {{ type }}
            </template>
            {{ billing }}
          </BaseText>
          <BaseText
            variant="body-small-medium"
            class="checkout-plan__members"
          >
            &nbsp;&nbsp;•&nbsp;&nbsp;{{ members }}
          </BaseText>
        </div>
        <BaseText
          variant="headline-6-bold"
          as="p"
          class="checkout-plan__price"
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
            {{ formattedPrice(discountedPrice) }}
          </template>
          <template v-else>{{ formattedPrice(price) }}</template>

          <BaseText variant="body-small-medium">
            {{ type === "individual" ? " / per month" : " / member per month" }}
          </BaseText>
        </BaseText>
        <BaseText
          v-if="savings && savings > 0"
          variant="body-3-semibold"
          as="p"
          class="checkout-plan__savings"
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
      </div>
    </BaseSheet>
  </label>
</template>

<style lang="scss" scoped>
.checkout-plan {
  cursor: pointer;
  display: block;

  &__icon {
    width: 26px;
    height: 26px;
    border-radius: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border: 1px solid $color-base-black-100;

    & > * {
      display: none;
    }

    @at-root .checkout-plan:has(.checkout-plan__input:checked) & {
      background-color: $color-base-black-100;

      & > * {
        display: block;
        color: $color-base-white-100;
      }
    }
  }

  &__card {
    background-color: transparent;
    border: unset;
    display: grid;
    grid-template-columns: 26px 1fr;
    column-gap: 16px;
    align-items: center;

    @at-root .checkout-plan:hover & {
      background: $color-base-black-5;
    }

    @at-root .checkout-plan:has(.checkout-plan__input:checked) & {
      background: $color-base-black-10;
    }

    @at-root .checkout-plan:has(.checkout-plan__input:disabled):hover & {
      background: unset;
    }

    @at-root .checkout-plan:has(.checkout-plan__input:checked):hover & {
      background: $color-base-black-10;
    }
  }

  &:has(.checkout-plan__input:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &__title {
    display: flex;
    align-items: baseline;
  }

  &__type {
    text-transform: capitalize;
  }

  &__price {
    margin-top: 2px;

    &--original {
      text-decoration: line-through;
      margin-right: 4px;
      opacity: 0.5;
    }
  }

  &__savings {
    @at-root .checkout-plan--individual & {
      color: $color-brand-1-100-dark;
    }

    @at-root .checkout-plan--couple & {
      color: $color-brand-2-90-light;
    }

    @at-root .checkout-plan--family & {
      color: $color-brand-3-90-light;
    }
  }

  &__input {
    display: none;
  }
}
</style>
