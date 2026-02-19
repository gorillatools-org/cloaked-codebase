<script setup lang="ts">
import {
  computed,
  inject,
  onMounted,
  ref,
  toRef,
  useTemplateRef,
  watch,
} from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import MCheckoutPaymentMethodSelector from "@/features/checkout/mobile/MCheckoutPaymentMethodSelector.vue";
import MCheckoutPaymentOverview from "@/features/checkout/mobile/MCheckoutPaymentOverview.vue";
import MCheckoutPaymentAgreements from "@/features/checkout/mobile/MCheckoutPaymentAgreements.vue";
import CheckoutTerms from "@/features/checkout/CheckoutTerms.vue";
import CheckoutCouponField from "@/features/checkout/CheckoutCouponField.vue";
import CheckoutCta from "@/features/checkout/CheckoutCta.vue";
import MCheckoutGuarantee from "@/features/checkout/mobile/MCheckoutGuarantee.vue";
import { usePaymentSetup } from "@/features/checkout/usePaymentSetup.ts";
import type { Plan, PlanProvider } from "@/features/subscribe/types.ts";
import {
  checkoutSessionInjectionKey,
  headlessAuthInjectionKey,
  paypalButtonsInjectionKey,
  stripeElementsInjectionKey,
} from "@/features/checkout/injectionKeys.ts";

type PaymentMethodOption = {
  value: PlanProvider;
  label: string;
};

type MCheckoutPaymentProps = {
  plans: Plan[];
  error: string | null;
};

const props = withDefaults(defineProps<MCheckoutPaymentProps>(), {
  plans: () => [],
  error: null,
});

const emit = defineEmits<{
  (e: "complete"): void;
}>();

const paymentMethodOptions: PaymentMethodOption[] = [
  { value: "stripe", label: "Credit card" },
  { value: "paypal", label: "Paypal" },
];

const stripeRef = useTemplateRef("stripeRef");
const paypalRef = useTemplateRef("paypalRef");

const headlessAuth = inject(headlessAuthInjectionKey);
const stripeElements = inject(stripeElementsInjectionKey);
const paypalButtons = inject(paypalButtonsInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);

const isCouponFieldVisible = ref(!!checkoutSession?.coupon);
const isStripeFormComplete = ref(false);

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

const isCtaDisabled = computed(
  () => checkoutSession?.method === "stripe" && !isStripeFormComplete.value
);

const showPaypalButton = computed(
  () =>
    checkoutSession?.method === "paypal" &&
    checkoutSession?.isRegistered &&
    checkoutSession?.isLoggedIn &&
    !checkoutSession?.isPaid
);

onMounted(() => {
  loadStripe();
  loadPaypal();
});

const toggleCouponField = () => {
  isCouponFieldVisible.value = !isCouponFieldVisible.value;
};

// Listen for Stripe PaymentElement validation changes
watch(
  () => stripeElements?.paymentElement?.value,
  (paymentEl, _oldEl, onCleanup) => {
    if (paymentEl) {
      isStripeFormComplete.value = false;
      const handler = (event: { complete: boolean }) => {
        isStripeFormComplete.value = event.complete;
      };

      paymentEl.on("change", handler);

      onCleanup(() => {
        paymentEl.off("change", handler);
      });
    }
  },
  { immediate: true }
);

defineExpose({ refreshStripeIntent, toggleCouponField });
</script>

<template>
  <div class="mobile-checkout-payment">
    <MCheckoutGuarantee class="mobile-checkout-payment__guarantee" />

    <BaseText
      variant="body-small-medium"
      class="mobile-checkout-payment__secured-text"
    >
      All transactions are secured and encrypted by
      <strong v-if="checkoutSession?.method === 'stripe'">Stripe.</strong>
      <strong v-else>PayPal.</strong>
    </BaseText>

    <MCheckoutPaymentMethodSelector
      v-if="checkoutSession"
      v-model="checkoutSession.method"
      class="mobile-checkout-payment__method-selector"
      :options="paymentMethodOptions"
      :disabled="isReadOnly"
    />

    <div
      v-show="checkoutSession?.method === 'stripe'"
      class="mobile-checkout-payment__form"
    >
      <CheckoutCouponField
        v-show="isCouponFieldVisible"
        :plan="selectedPlan"
      />
      <div
        ref="stripeRef"
        class="mobile-checkout-payment__stripe"
      />
    </div>

    <BaseInputFeedback
      v-if="error"
      variant="error"
      :message="error"
      class="mobile-checkout-payment__error"
    />

    <MCheckoutPaymentOverview
      :plans="props.plans"
      class="mobile-checkout-payment__overview"
    />

    <MCheckoutPaymentAgreements class="mobile-checkout-payment__agreements" />

    <CheckoutCta
      v-if="!showPaypalButton"
      :plans="props.plans"
      :disabled="isCtaDisabled"
      class="mobile-checkout-payment__cta"
      @click="emit('complete')"
    />

    <div
      v-show="showPaypalButton"
      ref="paypalRef"
      class="mobile-checkout-payment__paypal"
    />

    <CheckoutTerms class="mobile-checkout-payment__terms">
      By subscribing, you agree to be charged the total shown above. Your plan
      renews automatically until you cancel.
    </CheckoutTerms>
  </div>
</template>

<style lang="scss" scoped>
.mobile-checkout-payment {
  &__guarantee {
    margin-top: 6px;
  }

  &__secured-text {
    display: block;
    margin-top: 20px;
    color: $color-base-black-60;
  }

  &__method-selector {
    margin-top: 16px;
  }

  &__form {
    margin-top: 16px;

    :deep(.base-input__input) {
      border: 1px solid $color-base-black-5;
      border-radius: 12px;
      height: 56px;
      background-color: $color-base-black-5;

      &:focus {
        border-color: $color-primary-100;
      }

      &::placeholder {
        color: $color-neutral-250;
      }
    }
  }

  &__stripe {
    margin-top: 8px;
  }

  &__paypal {
    margin-top: 16px;
    padding-bottom: 16px;
  }

  &__error {
    display: block;
    margin-top: 16px;
  }

  &__overview {
    margin-top: 24px;
  }

  &__agreements {
    margin-top: 24px;
  }

  &__cta {
    margin-top: 24px;
  }

  &__terms {
    margin-top: 24px;
  }
}
</style>
