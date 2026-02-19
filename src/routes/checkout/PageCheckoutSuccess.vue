<script setup lang="ts">
import { useRouter } from "vue-router";
import { inject, onBeforeMount } from "vue";
import PageCheckoutSuccessRecovery from "@/features/subscribe/PageCheckoutSuccessRecovery.vue";
import PageCheckoutSuccessPasswordless from "@/features/subscribe/PageCheckoutSuccessPasswordless.vue";
import {
  accountRecoveryInjectionKey,
  checkoutSessionInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import { posthogCapture } from "@/scripts/posthog";
import { useDisplay } from "@/composables/useDisplay";
import UserService from "@/api/actions/user-service.js";
import { POA_AGREEMENT_ACCEPTED } from "@/scripts/userFlags";

const accountRecovery = inject(accountRecoveryInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);

const router = useRouter();

const { isMobile } = useDisplay();

const capturePoaAgreementAcceptance = () => {
  const poaAgreementAccepted = checkoutSession?.poaAgreementAccepted ?? false;

  posthogCapture("user_signed_up", {
    poa_agreement_accepted: poaAgreementAccepted,
  });

  UserService.setFlag({
    name: POA_AGREEMENT_ACCEPTED,
    value: poaAgreementAccepted,
  });
};

const onContinue = async (hasSkipped = false) => {
  posthogCapture("user_signed_up_and_paid", {
    signupType: accountRecovery?.value.password ? "password" : "passwordless",
    hasSkippedUsernameScreen: hasSkipped,
  });

  const { payload: chatbotPayload } = await fetchFeatureFlag(
    "post_checkout_chatbot_experience"
  );

  const { payload: downloadPayload } = await fetchFeatureFlag(
    "post_checkout_download_app"
  );

  if (chatbotPayload?.length && isMobile.value) {
    router.push({ name: "CheckoutOnboarding" });
  } else if (downloadPayload?.length && isMobile.value) {
    router.push({ name: "CheckoutDownloadApp" });
  } else {
    router.push({ name: "Home" });
  }
};

onBeforeMount(async () => {
  const skipUsernameConfirmation = await fetchFeatureFlag(
    "skip-username-confirmation-page"
  );

  capturePoaAgreementAcceptance();

  if (
    skipUsernameConfirmation.value === true &&
    !accountRecovery?.value.password
  ) {
    onContinue(true);
  }
});
</script>

<template>
  <PageCheckoutSuccessRecovery
    v-if="!!accountRecovery?.password"
    :account="accountRecovery"
    class="page-checkout-success"
    @continue="onContinue"
  />
  <PageCheckoutSuccessPasswordless
    v-else
    :account="accountRecovery"
    class="page-checkout-success"
    @continue="onContinue"
  />
</template>

<style lang="scss" scoped>
.page-checkout-success {
  height: auto;
}
</style>
