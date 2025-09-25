<script setup lang="ts">
import {
  onBeforeMount,
  onMounted,
  provide,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import HeadlessSignup from "@/features/headless-signup/HeadlessSignup.vue";
import CloudflareCaptcha from "@/features/headless-signup/CloudflareCaptcha.vue";
import CheckoutReviews from "@/features/checkout/CheckoutReviews.vue";
import CheckoutHeader from "@/features/checkout/CheckoutHeader.vue";
import SubscriptionService from "@/api/settings/subscription-services.js";
import { useColorScheme } from "@/composables/useColorScheme";
import { useStripeElements } from "@/features/checkout/useStripeElements.ts";
import { useHeadlessUser } from "@/features/headless-signup/useHeadlessUser.ts";
import { useCheckoutSession } from "@/features/checkout/useCheckoutSession.ts";
import { useTierSubscription } from "@/features/checkout/useTierSubscription.ts";
import type { Tier } from "@/features/subscribe/types.ts";
import {
  checkoutSessionInjectionKey,
  headlessAuthInjectionKey,
  stripeElementsInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import { PH_FEATURE_FLAG_TIERED_PRICING_EXPERIMENT_1 } from "@/scripts/posthogEvents";

const { setColorScheme } = useColorScheme();
onBeforeMount(() => setColorScheme("light"));

const headlessIframe = useTemplateRef("headlessIframe");
const cloudflareCaptcha = useTemplateRef("cloudflareCaptcha");

const headlessAuth = useHeadlessUser();
const stripeElements = useStripeElements();
const checkoutSession = useCheckoutSession();
const subscription = useTierSubscription();

// Load PostHog feature flag for tiered pricing experiment
const {
  featureFlag: tieredPricingExperiment,
  hasLoadedFeatureFlag: hasTieredPricingFlagLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_TIERED_PRICING_EXPERIMENT_1);

provide(stripeElementsInjectionKey, stripeElements);
provide(headlessAuthInjectionKey, headlessAuth);
provide(checkoutSessionInjectionKey, checkoutSession);

const tiers = ref<Tier[]>([]);

onMounted(async () => {
  if (!headlessIframe.value) {
    return;
  }

  // calls we can initiate without a user
  const loadStripePromise = stripeElements.loadStripe();
  const mountIframePromise = headlessAuth.mountIframe(headlessIframe.value.$el);
  const verifyCaptchaPromise = cloudflareCaptcha.value?.verify();

  // calls to create a user
  await mountIframePromise;
  const cloudflareToken = await verifyCaptchaPromise;
  await headlessAuth.createHeadlessUser({ captcha: cloudflareToken });

  // calls we can only make with a user
  const fetchUserPromise = headlessAuth.fetchHeadlessUser();
  const fetchSubscriptionPromise = subscription.fetchSubscription();
  const getTiersPromise = SubscriptionService.getTiers();
  const getSetupIntentPromise = SubscriptionService.getTierSetupIntent();
  tiers.value = await getTiersPromise;

  // preloading stripe payment elements
  await loadStripePromise;
  const intent = await getSetupIntentPromise;
  stripeElements.loadStripeElements(intent);
  stripeElements.createPaymentElement();

  await fetchUserPromise;
  await fetchSubscriptionPromise;
});

const router = useRouter();
const route = useRoute();

// Watch for PostHog feature flag to redirect to old checkout if in control group
watch(
  () => ({
    flagLoaded: hasTieredPricingFlagLoaded.value,
    flagValue: tieredPricingExperiment.value,
  }),
  ({ flagLoaded, flagValue }) => {
    if (flagLoaded && flagValue === "control") {
      router.replace({
        name: "SubscribeNow",
        query: route.query,
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="page-checkout">
    <CheckoutReviews />
    <CheckoutHeader />
    <router-view>
      <template #default="{ Component }">
        <Component
          :is="Component"
          :tiers="tiers"
          class="page-checkout__page"
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

.page-checkout {
  &__page {
    max-width: 1000px + 2 * 16px;
    width: 100%;
    padding: 0 16px 24px;
    margin: 24px auto 0;

    @media all and (min-width: $screen-xl) {
      margin-top: 16px;
    }
  }
}
</style>
