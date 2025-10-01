<script setup lang="ts">
import { inject, onMounted, ref, useTemplateRef } from "vue";
import SubscriptionService from "@/api/settings/subscription-services";
import CheckoutCardReview from "@/features/checkout/CheckoutCardReview.vue";
import CheckoutCardPayment from "@/features/checkout/CheckoutCardPayment.vue";
import CheckoutCardAccount from "@/features/checkout/CheckoutCardAccount.vue";
import { useRouter } from "vue-router";
import { useTierSubscription } from "@/features/checkout/useTierSubscription.ts";
import {
  checkoutSessionInjectionKey,
  headlessAuthInjectionKey,
  stripeElementsInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { Tier } from "@/features/subscribe/types.ts";
import { posthogCapture } from "@/scripts/posthog";

onMounted(() => posthogCapture("tier_checkout_viewed_payment"));

type PageCheckoutPaymentProps = {
  tiers: Tier[];
};

withDefaults(defineProps<PageCheckoutPaymentProps>(), {
  tiers: () => [],
});

const router = useRouter();
const cardAccount = useTemplateRef("cardAccount");

const stripeElements = inject(stripeElementsInjectionKey);
const headlessAuth = inject(headlessAuthInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);
const subscription = useTierSubscription();

const createAccountError = ref<string | null>(null);
const processPaymentError = ref<string | null>(null);
const logInError = ref<string | null>(null);

type CheckoutStepHandler = () => Promise<boolean>;

const onCreateAccount: CheckoutStepHandler = async () => {
  if (!checkoutSession || !headlessAuth || !cardAccount.value) {
    return false;
  }

  if (checkoutSession.isRegistered) {
    return true;
  }

  checkoutSession.status = "signing-up";

  const credentials = await cardAccount.value.verifyForm();

  if (!credentials) {
    return false;
  }

  await headlessAuth.updateHeadlessUser(credentials);

  if (headlessAuth.updateHeadlessUserError.value) {
    return false;
  }

  await headlessAuth.fetchHeadlessUser();

  return checkoutSession.isRegistered;
};

const onProcessPayment: CheckoutStepHandler = async () => {
  if (!checkoutSession || !stripeElements) {
    return false;
  }

  if (checkoutSession.isPaid) {
    return true;
  }

  posthogCapture("tier_checkout_purchase_attempted");

  checkoutSession.status = "processing-payment";

  await stripeElements.confirmPaymentElement();

  if (stripeElements.stripeError.value) {
    processPaymentError.value =
      "Payment failed. Please check your payment information and try again.";
    return false;
  }

  try {
    const { selectedTier, selectedBilling } = checkoutSession;
    await SubscriptionService.subscribeToTier({
      tier: selectedTier,
      billing: selectedBilling,
    });
  } catch {
    processPaymentError.value =
      "Failed to process subscription. Please try again.";
    return false;
  }

  await subscription.fetchSubscription();

  if (checkoutSession.isPaid) {
    posthogCapture("tier_checkout_purchase_successful");
  }

  return checkoutSession.isPaid;
};

const onLogIn: CheckoutStepHandler = async () => {
  if (!checkoutSession || !headlessAuth) {
    return false;
  }

  if (checkoutSession.isLoggedIn) {
    return true;
  }

  checkoutSession.status = "signing-in";

  await headlessAuth.loginHeadlessUser();

  if (headlessAuth.loginUserError.value) {
    return false;
  }

  return checkoutSession.isLoggedIn;
};

const onComplete = async () => {
  if (!checkoutSession) {
    return;
  }

  createAccountError.value = null;
  processPaymentError.value = null;
  logInError.value = null;

  const isPaid = await onProcessPayment();

  if (!isPaid) {
    checkoutSession.status = null;
    processPaymentError.value = "Failed to process payment. Please try again.";
    return;
  }

  const isRegistered = await onCreateAccount();

  if (!isRegistered) {
    checkoutSession.status = null;
    createAccountError.value = "Failed to create an account. Please try again.";
    return;
  }

  const isLoggedIn = await onLogIn();

  if (!isLoggedIn) {
    logInError.value = "Failed to log in. Please try again.";
    checkoutSession.status = null;
    return;
  }

  await router.push({ name: "Home" });
  checkoutSession.status = null;
};
</script>

<template>
  <div class="page-checkout-payment">
    <CheckoutCardAccount
      ref="cardAccount"
      class="page-checkout-payment__account"
      :error="createAccountError || logInError"
    />
    <CheckoutCardPayment
      class="page-checkout-payment__payment"
      :error="processPaymentError"
      @clear-error="processPaymentError = null"
    />
    <CheckoutCardReview
      class="page-checkout-payment__review"
      :tiers="tiers"
      @complete="onComplete"
    />
  </div>
</template>

<style lang="scss" scoped>
.page-checkout-payment {
  display: grid;
  gap: 24px;
  grid-template:
    "account"
    "payment"
    "review" / 1fr;

  @media all and (min-width: $screen-lg) {
    align-items: start;
    grid-template:
      "account review" min-content
      "payment review" 1fr / 1fr 1fr;
  }

  &__account {
    grid-area: account;
  }

  &__payment {
    grid-area: payment;
  }

  &__review {
    grid-area: review;

    @media all and (min-width: $screen-lg) {
      position: sticky;
      top: 24px;
    }
  }

  &__form-signup {
    margin-top: 16px;
  }

  :deep(.checkout-paragraph) {
    color: $color-base-black-60;
  }
}
</style>
