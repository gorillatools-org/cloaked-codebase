<script setup lang="ts">
import { onMounted, provide, ref, useTemplateRef, watchEffect } from "vue";
import { useStore } from "vuex";
import HeadlessSignup from "@/features/headless-signup/HeadlessSignup.vue";
import CloudflareCaptcha from "@/features/headless-signup/CloudflareCaptcha.vue";
import SubscriptionService from "@/api/settings/subscription-services.js";
import { useCheckoutSession } from "@/features/checkout/useCheckoutSession.ts";
import { useHeadlessUser } from "@/features/headless-signup/useHeadlessUser.ts";
import { useStripeElements } from "@/features/checkout/useStripeElements.ts";
import { usePaypalButtons } from "@/features/checkout/usePaypalButtons.ts";
import { useCountdownDiscount } from "@/features/checkout/useCountdownDiscount.ts";
import { useCouponDiscount } from "@/features/checkout/useCouponDiscount.ts";
import { useAccountRecovery } from "@/features/checkout/useAccountRecovery.ts";
import { useSubscription } from "@/features/checkout/useSubscription.ts";
import {
  accountRecoveryInjectionKey,
  checkoutSessionInjectionKey,
  countdownDiscountInjectionKey,
  couponDiscountInjectionKey,
  headlessAuthInjectionKey,
  paypalButtonsInjectionKey,
  signupFormInjectionKey,
  stripeElementsInjectionKey,
  plansExperimentInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { Plan } from "@/features/subscribe/types.ts";
import { useSignupForm } from "@/features/checkout/useSignupForm.ts";
import { usePlansExperiment } from "@/features/checkout/usePlansExperiment.ts";
import { useToast } from "@/composables/useToast";

const headlessIframe = useTemplateRef("headlessIframe");
const cloudflareCaptcha = useTemplateRef("cloudflareCaptcha");
const headlessAuth = useHeadlessUser();
const plansExperiment = usePlansExperiment(headlessAuth.headlessUser);
const signupForm = useSignupForm();
const stripeElements = useStripeElements();
const paypalButtons = usePaypalButtons();
const checkoutSession = useCheckoutSession();
const countdownDiscount = useCountdownDiscount();
const couponDiscount = useCouponDiscount();
const accountRecovery = useAccountRecovery();

provide(headlessAuthInjectionKey, headlessAuth);
provide(signupFormInjectionKey, signupForm);
provide(stripeElementsInjectionKey, stripeElements);
provide(paypalButtonsInjectionKey, paypalButtons);
provide(checkoutSessionInjectionKey, checkoutSession);
provide(countdownDiscountInjectionKey, countdownDiscount);
provide(couponDiscountInjectionKey, couponDiscount);
provide(accountRecoveryInjectionKey, accountRecovery);
provide(plansExperimentInjectionKey, plansExperiment);

const subscription = useSubscription();

const store = useStore();
const toast = useToast();

const plans = ref<Plan[]>(store.getters["subscription/getPlans"]);

onMounted(async () => {
  try {
    if (!headlessIframe.value) {
      throw new Error("Headless iframe not found");
    }

    // calls we can initiate without a user
    const loadStripePromise = stripeElements.loadStripe();
    const loadPaypalPromise = paypalButtons.loadPaypal();
    const mountIframePromise = headlessAuth.mountIframe(
      headlessIframe.value.$el
    );
    const verifyCaptchaPromise = cloudflareCaptcha.value?.verify();

    // calls to create a user
    await mountIframePromise;
    const cloudflareToken = await verifyCaptchaPromise;
    await headlessAuth.createHeadlessUser({ captcha: cloudflareToken });

    // calls we can only make with a user
    const fetchUserPromise = headlessAuth.fetchHeadlessUser();
    const fetchSubscriptionPromise = subscription.fetchSubscription();

    if (!plans.value?.length) {
      plans.value = await SubscriptionService.getSubscriptionPlans();
    }

    countdownDiscount.resume();

    // waiting for libraries
    await loadStripePromise;
    await loadPaypalPromise;

    // waiting for user state
    await fetchUserPromise;
    await fetchSubscriptionPromise;
  } catch (error) {
    console.error("Error initializing checkout:", error);
    toast.error(
      "We're having trouble loading checkout right now. Refresh the page to try again."
    );
  }
});

watchEffect(() => {
  if (
    plansExperiment.experimentType.value === "discounted-annual-plans" &&
    checkoutSession.billing === "annually"
  ) {
    countdownDiscount.updateDiscount(33);
  } else {
    countdownDiscount.updateDiscount(20);
  }
});
</script>

<template>
  <div class="page-checkout">
    <router-view>
      <template #default="{ Component }">
        <Component
          :is="Component"
          :plans="plans"
        />
      </template>
    </router-view>
    <CloudflareCaptcha ref="cloudflareCaptcha" />
    <HeadlessSignup ref="headlessIframe" />
  </div>
</template>

<style lang="scss" scoped>
// disabling - all these colors still show up when scrolling beyond viewport borders
:global(.app:has(.page-checkout)),
:global(main:has(.page-checkout)),
:global(body:has(.page-checkout)) {
  background-color: unset !important;
}

:global(#app:has(.page-checkout)) {
  height: unset;
}

:global(:root:has(.page-checkout)) {
  background-color: $color-primary-1;
}

:global(body:has(.page-checkout)) {
  color: $color-base-black-100;
}
</style>
