<script setup lang="ts">
import {
  inject,
  onBeforeMount,
  ref,
  toRef,
  toValue,
  useTemplateRef,
} from "vue";
import { useRouter } from "vue-router";
import SubscriptionService from "@/api/settings/subscription-services";
import CheckoutCardPlans from "@/features/checkout/CheckoutCardPlans.vue";
import CheckoutCardDiscount from "@/features/checkout/CheckoutCardDiscount.vue";
import CheckoutCardAccount from "@/features/checkout/CheckoutCardAccount.vue";
import CheckoutCardPayment from "@/features/checkout/CheckoutCardPayment.vue";
import { useColorScheme } from "@/composables/useColorScheme.ts";
import { useSelectedPlan } from "@/features/checkout/useSelectedPlan.ts";
import { useSubscription } from "@/features/checkout/useSubscription.ts";
import {
  checkoutSessionInjectionKey,
  headlessAuthInjectionKey,
  paypalButtonsInjectionKey,
  stripeElementsInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { Plan } from "@/features/subscribe/types.ts";
import store from "@/store";
import { generateConsistentFakeName } from "@/utils/generateFakeName";
import CheckoutCardFeatures from "@/features/checkout/CheckoutCardFeatures.vue";

type PageCheckoutCombinedProps = {
  plans: Plan[];
};

const props = withDefaults(defineProps<PageCheckoutCombinedProps>(), {
  plans: () => [],
});

const { setColorScheme } = useColorScheme();
onBeforeMount(() => setColorScheme("light"));

const router = useRouter();
const cardAccount = useTemplateRef("cardAccount");

const stripeElements = inject(stripeElementsInjectionKey);
const paypalButtons = inject(paypalButtonsInjectionKey);
const headlessAuth = inject(headlessAuthInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);

const plans = toRef(() => props.plans);
const selectedPlan = useSelectedPlan(plans, checkoutSession);
const subscription = useSubscription();

const createAccountError = ref<string | null>(null);
const processPaymentError = ref<string | null>(null);
const logInError = ref<string | null>(null);

const stripeEmail = store.getters["settings/getStripe"]?.email;

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

const onProcessStripe: CheckoutStepHandler = async () => {
  if (!checkoutSession || !stripeElements) {
    return false;
  }

  if (checkoutSession.isPaid) {
    return true;
  }

  checkoutSession.status = "processing-payment";

  const paymentMethodId = await stripeElements.confirmPaymentElement({
    name: generateConsistentFakeName(stripeEmail),
  });

  if (stripeElements.stripeError.value || !paymentMethodId) {
    processPaymentError.value =
      "Payment failed. Please check your payment information and try again.";
    return false;
  }

  try {
    await SubscriptionService.subscribe({
      price_id: toValue(selectedPlan)?.price_id,
      payment_method_id: paymentMethodId,
    });
  } catch {
    processPaymentError.value =
      "Failed to process subscription. Please try again.";
    return false;
  }

  await subscription.pollSubscription("PAID");

  return checkoutSession.isPaid;
};

const onProcessPaypal: CheckoutStepHandler = async () => {
  if (!checkoutSession || !paypalButtons) {
    return false;
  }

  if (checkoutSession.isPaid) {
    return true;
  }

  checkoutSession.status = "processing-payment";

  if (paypalButtons.paypalError.value) {
    processPaymentError.value =
      "Payment failed. Please check your payment information and try again.";
    return false;
  }

  try {
    await SubscriptionService.registerPaypal(
      paypalButtons.paypalSubscriptionId.value
    );
  } catch {
    processPaymentError.value =
      "Failed to process subscription. Please try again.";
    return false;
  }

  await subscription.pollSubscription("PAID");

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

const onCompleteStripe = async () => {
  if (!checkoutSession) {
    return;
  }

  createAccountError.value = null;
  processPaymentError.value = null;
  logInError.value = null;

  const isRegistered = await onCreateAccount();

  if (!isRegistered) {
    checkoutSession.status = null;
    createAccountError.value = "Failed to create an account. Please try again.";
    return;
  }

  const isPaid = await onProcessStripe();

  if (!isPaid) {
    checkoutSession.status = null;
    processPaymentError.value = "Failed to process payment. Please try again.";
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

const onCompletePaypal = async () => {
  if (!checkoutSession) {
    return;
  }

  createAccountError.value = null;
  processPaymentError.value = null;
  logInError.value = null;

  if (!checkoutSession.isRegistered) {
    const isRegistered = await onCreateAccount();

    if (!isRegistered) {
      checkoutSession.status = null;
      createAccountError.value =
        "Failed to create an account. Please try again.";
      return;
    }

    checkoutSession.status = null;
    return;
  }

  const isPaid = await onProcessPaypal();

  if (!isPaid) {
    checkoutSession.status = null;
    processPaymentError.value = "Failed to process payment. Please try again.";
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

const onComplete = () => {
  if (!checkoutSession) {
    return;
  }

  return checkoutSession.method === "stripe"
    ? onCompleteStripe()
    : onCompletePaypal();
};
</script>

<template>
  <div class="page-checkout-combined">
    <div class="page-checkout-combined__column">
      <CheckoutCardPlans :plans="plans" />
      <CheckoutCardDiscount />
      <CheckoutCardFeatures />
    </div>
    <div class="page-checkout-combined__column">
      <CheckoutCardAccount
        ref="cardAccount"
        :error="createAccountError || logInError"
      />
      <CheckoutCardPayment
        :plans="plans"
        :error="processPaymentError"
        @complete="onComplete"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-checkout-combined {
  max-width: 1000px + 2 * 16px;
  width: 100%;
  padding: 16px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media all and (min-width: $screen-md) {
    flex-direction: row;
  }

  &__column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
