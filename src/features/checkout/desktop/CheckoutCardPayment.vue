<script setup lang="ts">
import { computed, inject, onMounted, ref, toRef, useTemplateRef } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutTabs from "@/features/checkout/CheckoutTabs.vue";
import CheckoutParagraph from "@/features/subscribe/components/CheckoutParagraph.vue";
import CheckoutTerms from "@/features/checkout/CheckoutTerms.vue";
import CheckoutDivider from "@/features/subscribe/components/CheckoutDivider.vue";
import CheckoutCouponField from "@/features/checkout/CheckoutCouponField.vue";
import CheckoutReceipt from "@/features/checkout/CheckoutReceipt.vue";
import CheckoutCta from "@/features/checkout/CheckoutCta.vue";
import CheckoutPoaAgreement from "@/features/checkout/CheckoutPoaAgreement.vue";
import {
  formattedPrice,
  isValidPrice,
} from "@/features/subscribe/composables/utils.ts";
import { usePaymentSetup } from "@/features/checkout/usePaymentSetup.ts";
import { useCheckoutPricing } from "@/features/checkout/useCheckoutPricing.ts";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_CHECKOUT_POA_AGREEMENT } from "@/scripts/posthogEvents";
import {
  checkoutSessionInjectionKey,
  countdownDiscountInjectionKey,
  couponDiscountInjectionKey,
  headlessAuthInjectionKey,
  paypalButtonsInjectionKey,
  stripeElementsInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { Plan, PlanProvider } from "@/features/subscribe/types.ts";

type PaymentMethodOption = {
  value: PlanProvider;
  label: string;
};

type CheckoutCardPaymentProps = {
  plans: Plan[];
  error: string | null;
};

const props = withDefaults(defineProps<CheckoutCardPaymentProps>(), {
  plans: () => [],
});

const emit = defineEmits(["complete"]);

const stripeRef = useTemplateRef("stripeRef");
const paypalRef = useTemplateRef("paypalRef");

const paymentMethodOptions: PaymentMethodOption[] = [
  { value: "stripe", label: "Card" },
  { value: "paypal", label: "Paypal" },
];

const headlessAuth = inject(headlessAuthInjectionKey);
const stripeElements = inject(stripeElementsInjectionKey);
const paypalButtons = inject(paypalButtonsInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);
const countdownDiscount = inject(countdownDiscountInjectionKey);
const couponDiscount = inject(couponDiscountInjectionKey);

const isCouponFieldVisible = ref(!!checkoutSession?.coupon);

const {
  selectedPlan,
  isReadOnly,
  loadStripe,
  loadPaypal,
  refreshStripeIntent,
} = usePaymentSetup({
  plans: toRef(() => props.plans),
  stripeRef,
  paypalRef,
  headlessAuth,
  stripeElements,
  paypalButtons,
  checkoutSession,
  onComplete: () => emit("complete"),
});

onMounted(() => {
  loadStripe();
  loadPaypal();
});

const { price, anchoredPrice, discountedPrice } = useCheckoutPricing({
  plans: toRef(() => props.plans),
  checkoutSession,
  countdownDiscount,
  couponDiscount,
});

const {
  featureFlag: poaAgreementFlag,
  hasLoadedFeatureFlag: poaAgreementFlagLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CHECKOUT_POA_AGREEMENT);

const showPoaAgreement = computed(
  () =>
    poaAgreementFlagLoaded.value &&
    (poaAgreementFlag.value === "poa-agreement" ||
      poaAgreementFlag.value === "permission-to-scrub-data" ||
      poaAgreementFlag.value === "permission-to-remove-data")
);

const showPaypalButton = computed(
  () =>
    checkoutSession?.method === "paypal" &&
    checkoutSession?.isRegistered &&
    checkoutSession?.isLoggedIn &&
    !checkoutSession?.isPaid
);

defineExpose({ refreshStripeIntent });
</script>

<template>
  <BaseSheet
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    rounding="sm"
    class="checkout-card-payment"
  >
    <div class="checkout-card-payment__header">
      <CheckoutTitle>Payment details</CheckoutTitle>
      <BaseText
        v-if="checkoutSession?.method === 'stripe'"
        as="button"
        variant="body-small-medium"
        class="checkout-card-payment__coupon-toggle"
        :disabled="isReadOnly"
        @click="isCouponFieldVisible = !isCouponFieldVisible"
      >
        Promo code?
      </BaseText>
    </div>
    <CheckoutParagraph
      variant="body-3-regular"
      class="checkout-card-payment__text"
    >
      All transactions are secured and encrypted by
      <strong v-if="checkoutSession?.method === 'stripe'">Stripe.</strong>
      <strong v-else>Paypal.</strong>
    </CheckoutParagraph>
    <CheckoutTabs
      v-if="checkoutSession"
      v-model="checkoutSession.method"
      :options="paymentMethodOptions"
      :disabled="isReadOnly"
      class="checkout-card-payment__tabs"
    />
    <div
      v-show="checkoutSession?.method === 'stripe'"
      class="checkout-card-payment__form"
    >
      <CheckoutCouponField
        v-show="isCouponFieldVisible"
        :plan="selectedPlan"
      />
      <div
        ref="stripeRef"
        class="checkout-card-payment__credit-card"
      />
    </div>
    <BaseInputFeedback
      v-if="error"
      variant="error"
      :message="error"
      class="checkout-card-payment__error"
    />
    <CheckoutDivider class="checkout-card-payment__divider" />
    <div class="checkout-card-payment__price">
      <BaseText variant="body-3-regular">Total</BaseText>
      <BaseText
        v-if="price"
        variant="headline-4-bold"
        as="p"
      >
        <span
          v-if="isValidPrice(anchoredPrice)"
          class="checkout-card-payment__price--original"
        >
          {{ formattedPrice(anchoredPrice) }}
        </span>
        <span
          v-else-if="isValidPrice(discountedPrice)"
          class="checkout-card-payment__price--original"
        >
          {{ formattedPrice(price) }}
        </span>
        <template v-if="isValidPrice(discountedPrice)">
          {{ formattedPrice(discountedPrice) }}
        </template>
        <template v-else-if="isValidPrice(price)">
          {{ formattedPrice(price) }}
        </template>
        due today
      </BaseText>
    </div>
    <CheckoutPoaAgreement
      v-if="showPoaAgreement"
      :poa-agreement-flag="poaAgreementFlag"
      class="checkout-card-payment__poa-agreement"
    />
    <CheckoutReceipt
      v-if="headlessAuth?.headlessUser.value"
      class="checkout-card-payment__receipt"
    />
    <CheckoutCta
      v-if="!showPaypalButton"
      :plans="props.plans"
      class="checkout-card-payment__cta"
      @click="$emit('complete')"
    />
    <div
      v-show="showPaypalButton"
      ref="paypalRef"
      class="checkout-card-payment__paypal"
    />
    <CheckoutTerms class="checkout-card-payment__terms" />
  </BaseSheet>
</template>

<style lang="scss" scoped>
.checkout-card-payment {
  background: $color-base-black-5;
  border: none;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  &__coupon-toggle {
    padding: 0;
    background-color: transparent;
    border: 0;
    cursor: pointer;
    opacity: 0.8;

    &:hover {
      text-decoration: underline;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      text-decoration: none;
    }
  }

  &__text {
    color: $color-base-black-60;
  }

  &__tabs {
    margin-top: 16px;
  }

  &__form {
    margin-top: 16px;

    :deep(.base-input__input) {
      border-radius: 12px;
      height: 65px;
    }
  }

  &__credit-card {
    margin-top: 8px;
  }

  &__paypal {
    margin-top: 16px;
  }

  &__error {
    display: block;
    margin-top: 16px;
  }

  &__divider {
    margin: 16px 0;
  }

  &__price {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &--original {
      text-decoration: line-through;
      opacity: 0.5;
      margin-right: 4px;
    }
  }

  &__poa-agreement {
    margin-top: 12px;
  }

  &__receipt {
    margin-top: 12px;
  }

  &__cta {
    margin-top: 24px;
  }

  &__guarantee {
    margin-top: 12px;
  }

  &__terms {
    margin-top: 24px;
  }
}
</style>
