<script setup lang="ts">
import { onMounted, provide, ref, useTemplateRef } from "vue";
import HeadlessSignup from "@/features/headless-signup/HeadlessSignup.vue";
import CloudflareCaptcha from "@/features/headless-signup/CloudflareCaptcha.vue";
import SubscriptionService from "@/api/settings/subscription-services.js";
import { useCheckoutSession } from "@/features/checkout/useCheckoutSession.ts";
import { useHeadlessUser } from "@/features/headless-signup/useHeadlessUser.ts";
import { useStripeElements } from "@/features/checkout/useStripeElements.ts";
import { usePaypalButtons } from "@/features/checkout/usePaypalButtons.ts";
import { useSubscription } from "@/features/checkout/useSubscription.ts";
import {
  checkoutSessionInjectionKey,
  countdownDiscountInjectionKey,
  couponDiscountInjectionKey,
  headlessAuthInjectionKey,
  paypalButtonsInjectionKey,
  stripeElementsInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { Plan } from "@/features/subscribe/types.ts";
import { useCountdownDiscount } from "@/features/checkout/useCountdownDiscount.ts";
import { useCouponDiscount } from "@/features/checkout/useCouponDiscount.ts";

const headlessIframe = useTemplateRef("headlessIframe");
const cloudflareCaptcha = useTemplateRef("cloudflareCaptcha");

const headlessAuth = useHeadlessUser();
const stripeElements = useStripeElements();
const paypalButtons = usePaypalButtons();
const checkoutSession = useCheckoutSession();
const countdownDiscount = useCountdownDiscount();
const couponDiscount = useCouponDiscount();
const subscription = useSubscription();

provide(headlessAuthInjectionKey, headlessAuth);
provide(stripeElementsInjectionKey, stripeElements);
provide(paypalButtonsInjectionKey, paypalButtons);
provide(checkoutSessionInjectionKey, checkoutSession);
provide(countdownDiscountInjectionKey, countdownDiscount);
provide(couponDiscountInjectionKey, couponDiscount);

const plans = ref<Plan[]>([]);

onMounted(async () => {
  if (!headlessIframe.value) {
    return;
  }

  // calls we can initiate without a user
  const loadStripePromise = stripeElements.loadStripe();
  const loadPaypalPromise = paypalButtons.loadPaypal();
  const mountIframePromise = headlessAuth.mountIframe(headlessIframe.value.$el);
  const verifyCaptchaPromise = cloudflareCaptcha.value?.verify();

  // calls to create a user
  await mountIframePromise;
  const cloudflareToken = await verifyCaptchaPromise;
  await headlessAuth.createHeadlessUser({ captcha: cloudflareToken });

  // calls we can only make with a user
  const fetchUserPromise = headlessAuth.fetchHeadlessUser();
  const fetchSubscriptionPromise = subscription.fetchSubscription();
  const fetchPlansPromise = SubscriptionService.getSubscriptionPlans();
  const getSetupIntentPromise = SubscriptionService.createSetupIntent();
  plans.value = await fetchPlansPromise;
  countdownDiscount.start();

  // preloading stripe payment elements
  await loadStripePromise;
  const intent = await getSetupIntentPromise;
  stripeElements.loadStripeElements(intent);
  stripeElements.createPaymentElement();

  await loadPaypalPromise;
  await fetchUserPromise;
  await fetchSubscriptionPromise;
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
  background-color: $color-primary-5;
}
</style>
