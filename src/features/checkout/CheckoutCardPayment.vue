<script setup lang="ts">
import { computed, inject, ref, toRef, useTemplateRef } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutTabs from "@/features/checkout/CheckoutTabs.vue";
import CheckoutParagraph from "@/features/subscribe/components/CheckoutParagraph.vue";
import CheckoutTerms from "@/features/checkout/CheckoutTerms.vue";
import CheckoutDivider from "@/features/subscribe/components/CheckoutDivider.vue";
import { watchImmediate } from "@vueuse/core";
import { useColorScheme } from "@/composables/useColorScheme.ts";
import {
  formattedPrice,
  isValidPrice,
} from "@/features/subscribe/composables/utils.ts";
import { useSelectedPlan } from "@/features/checkout/useSelectedPlan.ts";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.ts";
import {
  checkoutSessionInjectionKey,
  countdownDiscountInjectionKey,
  couponDiscountInjectionKey,
  headlessAuthInjectionKey,
  paypalButtonsInjectionKey,
  stripeElementsInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { Plan, PlanProvider } from "@/features/subscribe/types.ts";
import { usePriceAnchor } from "@/features/subscribe/composables/usePriceAnchor.ts";
import { usePriceDiscount } from "@/features/subscribe/composables/usePriceDiscount.ts";
import CheckoutCouponField from "@/features/checkout/CheckoutCouponField.vue";
import BaseButton from "@/library/BaseButton.vue";

type CheckoutCardPaymentProps = {
  plans: Plan[];
  error: string | null;
};

const props = withDefaults(defineProps<CheckoutCardPaymentProps>(), {
  plans: () => [],
});

const emit = defineEmits(["complete"]);

const headlessAuth = inject(headlessAuthInjectionKey);
const stripeElements = inject(stripeElementsInjectionKey);
const paypalButtons = inject(paypalButtonsInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);
const countdownDiscount = inject(countdownDiscountInjectionKey);
const couponDiscount = inject(couponDiscountInjectionKey);

const { colorScheme } = useColorScheme();

const stripeRef = useTemplateRef("stripeRef");
const paypalRef = useTemplateRef("paypalRef");

const isReadOnly = computed(
  () => !!checkoutSession?.status || !!checkoutSession?.isPaid
);

const isStripeReady = computed(
  () => !!stripeElements?.paymentElement.value && !!stripeRef.value
);

const isPaypalReady = computed(
  () =>
    !!paypalButtons?.paypalButtons.value &&
    !!paypalRef.value &&
    !!selectedPlan.value &&
    headlessAuth?.headlessUser.value
);

const unwatchStripeReady = watchImmediate(isStripeReady, (isReady) => {
  if (isReady) {
    stripeElements?.mountPaymentElement(stripeRef, {
      scheme: colorScheme.value,
    });

    watchImmediate(colorScheme, () =>
      stripeElements?.updatePaymentElement({ scheme: colorScheme.value })
    );

    watchImmediate(isReadOnly, () => {
      stripeElements?.updatePaymentElement({ readOnly: isReadOnly.value });
    });

    unwatchStripeReady();
  }
});

const unwatchPaypalReady = watchImmediate(isPaypalReady, (isReady) => {
  if (isReady) {
    watchImmediate(
      () => selectedPlan.value,
      () => {
        if (!checkoutSession) {
          return;
        }

        if (checkoutSession.method === "paypal") {
          paypalButtons?.mountButtonElement(paypalRef, {
            plan_id: selectedPlan.value?.price_id ?? "",
            custom_id: headlessAuth?.headlessUser.value?.uuid ?? "",
            onSubscribed: () => {
              emit("complete");
            },
          });
        }
      }
    );

    unwatchPaypalReady();
  }
});

const status = computed(() => checkoutSession?.status ?? null);

const plans = toRef(() => props.plans);
const selectedPlan = useSelectedPlan(plans, checkoutSession);

const price = usePlanPrice(selectedPlan);
const anchoredPrice = usePriceAnchor(
  price,
  countdownDiscount?.discount ?? null
);
const discountedPrice = usePriceDiscount(
  price,
  toRef(() =>
    checkoutSession?.method === "stripe"
      ? (couponDiscount?.discount.value ?? null)
      : null
  )
);

type PaymentMethodOption = {
  value: PlanProvider;
  label: string;
};

const paymentMethodOptions: PaymentMethodOption[] = [
  { value: "stripe", label: "Card" },
  { value: "paypal", label: "Paypal" },
];

const isCouponFieldVisible = ref(!!checkoutSession?.coupon);

const showPaypalButton = computed(
  () =>
    checkoutSession?.method === "paypal" &&
    checkoutSession?.isRegistered &&
    !checkoutSession?.isPaid
);
</script>

<template>
  <BaseSheet
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    class="checkout-card-payment"
  >
    <div class="checkout-card-payment__header">
      <CheckoutTitle>Payment details</CheckoutTitle>
      <BaseText
        v-if="checkoutSession?.method === 'stripe'"
        as="button"
        variant="body-small-medium"
        class="checkout-card-payment__coupon-toggle"
        :disabled="!!checkoutSession?.status || !!checkoutSession?.isPaid"
        @click="isCouponFieldVisible = !isCouponFieldVisible"
      >
        Promo code?
      </BaseText>
    </div>
    <CheckoutTabs
      v-if="checkoutSession"
      v-model="checkoutSession.method"
      :options="paymentMethodOptions"
      :disabled="!!checkoutSession?.status || !!checkoutSession?.isPaid"
      class="checkout-card-payment__tabs"
    />
    <CheckoutParagraph variant="body-3-regular">
      All transactions are secured and encrypted by
      <strong v-if="checkoutSession?.method === 'stripe'">Stripe.</strong>
      <strong v-else>Paypal.</strong>
    </CheckoutParagraph>
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
      </BaseText>
    </div>
    <BaseButton
      v-if="!showPaypalButton"
      size="lg"
      full-width
      :disabled="!!status"
      :loading="!!status"
      class="checkout-card-payment__cta"
      @click="$emit('complete')"
    >
      <template v-if="status === 'signing-up'">Creating account</template>
      <template v-else-if="status === 'processing-payment'">
        Processing payment
      </template>
      <template v-else-if="status === 'signing-in'">Signing in</template>
      <template v-else-if="checkoutSession?.isPaid">Sign in</template>
      <template v-else-if="checkoutSession?.isRegistered">
        Complete purchase
      </template>
      <template v-else>Subscribe now</template>
    </BaseButton>
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

    &:hover {
      text-decoration: underline;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__tabs {
    margin-top: 10px;
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
