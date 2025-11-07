<script setup>
import store from "@/store";
import { ref, computed, useTemplateRef, watch, nextTick } from "vue";
import PageCheckout from "@/features/subscribe/PageCheckout.vue";
import SubscriptionService from "@/api/settings/subscription-services";
import PageCheckoutSuccessSignup from "@/features/subscribe/PageCheckoutSuccessSignup.vue";
import HeadlessSignup from "@/features/headless-signup/HeadlessSignup.vue";
import CloudflareCaptcha from "@/features/headless-signup/CloudflareCaptcha.vue";
import UserService from "@/api/actions/user-service";
import { useThemeQueryParameter } from "@/composables/useThemeQueryParameter";
import { usePostHogFunnelTracking } from "@/composables/usePosthogFunnelTracking";
import { useHeadlessUser } from "@/features/headless-signup/useHeadlessUser";
import { useFunnel } from "@/features/subscribe/composables/useFunnel";
import { FUNNEL_STEP } from "@/features/data-delete/utils";
import { useStripeIntentPrefetch } from "@/features/subscribe/composables/useStripeIntentPrefetch.js";
import { DATA_DELETE_REQUESTED, FROM_SUBSCRIBE_NOW } from "@/scripts/userFlags";
import { useRoute, useRouter } from "vue-router";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import { PH_FEATURE_FLAG_TIERED_PRICING_EXPERIMENT_1 } from "@/scripts/posthogEvents";
import { PH_FEATURE_FLAG_CLOAKED_PAY_ENABLE_SUBSCRIPTION } from "@/features/VirtualCards/constants/posthog-feature-flag";
import PageCheckoutBanner from "@/routes/checkout/PageCheckoutBanner.vue";
// Guard flag to prevent double initialization
let didInit = false;

const route = useRoute();
const router = useRouter();

const isCloakedPayCustomerRoute = computed(() => {
  return route.query.pay_customer === "true";
});

useThemeQueryParameter();
usePostHogFunnelTracking();

const {
  featureFlag: tieredPricingExperiment,
  hasLoadedFeatureFlag: hasTieredPricingFlagLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_TIERED_PRICING_EXPERIMENT_1);

const {
  featureFlag: cloakedPayEnableSubscription,
  hasLoadedFeatureFlag: cloakedPayEnableSubscriptionLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CLOAKED_PAY_ENABLE_SUBSCRIPTION);

const { prefetchIntents } = useStripeIntentPrefetch();

const { step, setStep } = useFunnel(FUNNEL_STEP.PAYMENT);

watch(
  () => ({
    flagLoaded: hasTieredPricingFlagLoaded.value,
    flagValue: tieredPricingExperiment.value,
    cloakedPaySubscriptionFlagLoaded: cloakedPayEnableSubscriptionLoaded.value,
    cloakedPaySubscriptionFlagValue: cloakedPayEnableSubscription.value,
  }),
  async ({
    flagLoaded,
    flagValue,
    cloakedPaySubscriptionFlagLoaded,
    cloakedPaySubscriptionFlagValue,
  }) => {
    if (!flagLoaded || !cloakedPaySubscriptionFlagLoaded) return;

    // Treat falsy/missing flag values as control branch
    if (
      (route.query.pay_customer && cloakedPaySubscriptionFlagValue) ||
      flagValue === "control" ||
      flagValue === false ||
      flagValue == null
    ) {
      // Wait for template refs to be mounted and check if already initialized
      await nextTick();
      if (didInit) return;

      // Initialize for control variant (includes "control", false, and null/undefined)
      await initializeControlFlow();
      didInit = true;
    } else {
      // Redirect immediately for explicit test variants only
      router.replace({
        name: "CheckoutPlans",
        query: route.query,
      });
      return;
    }
  },
  { immediate: true, flush: "post" }
);

const {
  createHeadlessUserError,
  createHeadlessUser,
  fetchHeadlessUser,
  updateHeadlessUserError,
  updateHeadlessUser,
  encryptHeadlessUser,
  mountIframe,
  headlessUser,
  loginHeadlessUser,
} = useHeadlessUser();

const headlessIframe = useTemplateRef("headlessIframe");
const cloudflareCaptcha = useTemplateRef("cloudflareCaptcha");

// Initialize control flow - only called for control variant after flag is loaded
const initializeControlFlow = async () => {
  // Reset authentication state for control flow only
  store.dispatch("authentication/setGuestToken", null);
  store.commit("authentication/setUser", null);

  // Wait for template refs to be fully available
  await nextTick();

  // Defensive guards for template refs
  if (!headlessIframe.value || !cloudflareCaptcha.value) {
    console.error("Required template refs not available");
    return;
  }

  // Guard iframe element access
  if (!headlessIframe.value.$el) {
    console.error("Headless iframe element not available");
    return;
  }

  // Mount iframe with element guard
  const mountIframePromise = mountIframe(headlessIframe.value.$el);

  // Guard Cloudflare captcha verification
  let cloudflareToken;
  try {
    cloudflareToken = await cloudflareCaptcha.value.verify();
  } catch (error) {
    console.error("Cloudflare captcha verification failed:", error);
    return;
  }

  // Only await mount promise after confirming element exists
  await mountIframePromise;
  await createUser(cloudflareToken);
};

const createUser = async (cloudflareToken) => {
  await createHeadlessUser({ captcha: cloudflareToken });

  if (createHeadlessUserError.value) {
    return;
  }

  const afterCreatePromises = [
    fetchHeadlessUser(),
    store.dispatch("subscription/init"),
    SubscriptionService.getSubscription(),
    UserService.setFlag({
      name: DATA_DELETE_REQUESTED,
      value: true,
    }),
  ];

  if (!route.query.phone) {
    afterCreatePromises.push(
      UserService.setFlag({
        name: FROM_SUBSCRIBE_NOW,
        value: true,
      })
    );
  }

  await Promise.allSettled(afterCreatePromises);
  prefetchIntents();
};

const isLoading = ref(false);

const account = ref({
  username: null,
  password: null,
  recovery: null,
});

const user = computed(() => {
  return store.getters["authentication/user"];
});

const isRealUser = computed(
  () => !!user.value && user.value?.account_version >= 2
);

const setUser = async ({ username, password, email, phone }, paymentMethod) => {
  try {
    isLoading.value = true;
    if (!isRealUser.value) {
      if (!user.value?.account_version || user.value?.account_version < 2) {
        // do not try to create account twice
        await updateHeadlessUser({ username, password, email, phone });

        if (updateHeadlessUserError.value) {
          throw new Error(updateHeadlessUserError.value);
        }
      }

      account.value.username = username?.length ? username : phone;
      account.value.password = password;

      await loginHeadlessUser();
      if (!user.value?.is_passwordless) {
        const recoveryKey = await encryptHeadlessUser();
        account.value.recovery = recoveryKey;
      }
      Promise.allSettled([fetchHeadlessUser(), UserService.getFlags()]);
    }

    if (paymentMethod.toLowerCase() === "card") {
      await checkoutRef.value?.subscribeWithStripe();
    }
  } finally {
    isLoading.value = false;
  }
};

async function onSubscribed() {
  sessionStorage.removeItem("questionnaire-skipped");
  setStep(FUNNEL_STEP.SUCCESS);
}

const checkoutRef = ref(null);
</script>

<template>
  <div class="subscribe-now">
    <PageCheckoutBanner />
    <PageCheckout
      v-if="step === FUNNEL_STEP.PAYMENT"
      ref="checkoutRef"
      :signup-error="updateHeadlessUserError"
      :is-loading="isLoading"
      :headless-user="headlessUser"
      @set-user="setUser"
      @subscribed="onSubscribed"
    />
    <PageCheckoutSuccessSignup
      v-else
      :account="account"
      :is-cloaked-pay-customer-route="isCloakedPayCustomerRoute"
    />
    <CloudflareCaptcha ref="cloudflareCaptcha" />
    <HeadlessSignup ref="headlessIframe" />
  </div>
</template>

<style lang="scss" scoped>
.subscribe-now {
  color: $color-primary-100;
  min-height: 100dvh;

  @at-root .theme-dark & {
    @include cloaked-gradient-background;
  }

  @at-root .theme-light & {
    background-color: $color-primary-5;
  }
}
</style>
