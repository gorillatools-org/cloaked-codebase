<script setup>
import store from "@/store";
import { onMounted, ref, onBeforeMount, computed } from "vue";
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
import { cameFromBuyCloaked, FUNNEL_STEP } from "@/features/data-delete/utils";
import { useStripeIntentPrefetch } from "@/features/subscribe/composables/useStripeIntentPrefetch.js";
import {
  DATA_DELETE_REQUESTED,
  CAME_FROM_BUY_CLOAKED,
  FROM_SUBSCRIBE_NOW,
} from "@/scripts/userFlags";
import { useRoute } from "vue-router";

const route = useRoute();

useThemeQueryParameter();
usePostHogFunnelTracking();

const { prefetchIntents } = useStripeIntentPrefetch();

const { step, setStep } = useFunnel(FUNNEL_STEP.PAYMENT);

onBeforeMount(() => {
  store.dispatch("authentication/setGuestToken", null);
  store.commit("authentication/setUser", null);
});

const {
  createHeadlessUserError,
  createHeadlessUser,
  fetchHeadlessUser,
  updateHeadlessUserError,
  updateHeadlessUser,
  encryptHeadlessUser,
  headlessIframeRef,
  mountHeadlessIframe,
  headlessUser,
  loginHeadlessUser,
} = useHeadlessUser();

const cloudflareCaptcha = ref(null);

onMounted(async () => {
  const mountIframePromise = mountHeadlessIframe();
  const cloudflareToken = await cloudflareCaptcha.value.verify();

  await mountIframePromise;
  await createUser(cloudflareToken);
});

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

  if (cameFromBuyCloaked()) {
    afterCreatePromises.push(
      UserService.setFlag({
        name: CAME_FROM_BUY_CLOAKED,
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
  setStep(FUNNEL_STEP.SUCCESS);
}

const checkoutRef = ref(null);
</script>

<template>
  <div class="subscribe-now">
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
    />
    <CloudflareCaptcha ref="cloudflareCaptcha" />
    <HeadlessSignup ref="headlessIframeRef" />
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
