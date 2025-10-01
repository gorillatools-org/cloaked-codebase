<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import store from "@/store";
import WalletActivity from "@/features/Wallet/WalletActivity.vue";
import KycFlow from "@/features/Wallet/KycFlow.vue";
import PayOnboarding from "@/features/Wallet/Onboarding/PayOnboarding.vue";
import VirtualCardsSubscriptionFlow from "@/features/VirtualCards/Subscription/VirtualCardsSubscriptionFlow.vue";
import VirtualCardsOffboardedUserSection from "@/features/VirtualCards/Sections/VirtualCardsOffboardedUserSection.vue";
import VirtualCardsSubscriptionStatus from "@/features/VirtualCards/Sections/VirtualCardsSubscriptionStatusSection.vue";
import VirtualCardsFallbackSection from "@/features/VirtualCards/Sections/VirtualCardsFallbackSection.vue";
import { EDDBehaviorEnum } from "@/types/Wallet/kyc";

type WalletPageComponent =
  | "SUBSCRIPTION_FLOW"
  | "SUBSCRIPTION_STATUS_PAYMENT_PROCESSING"
  | "SUBSCRIPTION_STATUS_PAYMENT_ERROR"
  | "SUBSCRIPTION_STATUS_KYC_REJECTED"
  | "SUBSCRIPTION_STATUS_KYC_IN_MANUAL_REVIEW"
  | "SUBSCRIPTION_STATUS_PLAN_DOWNGRADE_REQUIRED"
  | "ONBOARDING"
  | "WALLET"
  | "OFFBOARDED_USER"
  | "FALLBACK"
  | "OLD_KYC_FLOW";

onMounted(() => {
  store.dispatch("authentication/getUser");
});

const user = computed(() => {
  return store.state.authentication?.user;
});

const eddState = computed(() => {
  return user?.value?.edd_state || null;
});

const isCloakedPaySubscriptionEnabled = computed(() => {
  return !!user?.value?.flags?.["cloaked_pay_enable_subscription"];
});

const isEnabled = computed(() => {
  return (
    !!user?.value?.cloaked_card_enabled ||
    user?.value?.cloaked_card_enabled_status === "enabled"
  );
});

const enabledStatus = computed(() => {
  return user?.value?.cloaked_card_enabled_status;
});

const isKycValidated = computed(() => {
  return !!user.value?.cloaked_card_kyc_configured;
});

const isUserOnboarded = computed(() => {
  return !!user.value?.cloaked_card_onboarded;
});

const isOnboardingCompleted = computed(() => {
  return !!user.value?.cloaked_card_post_kyc_onboarding_completed;
});

const subscriptionStatus = computed(() => {
  return user.value?.cloaked_card_subscription_intent_status || null;
});

const showSubscriptionStatus = computed(() => {
  if (!currentPage.value) {
    return false;
  }

  const pages: WalletPageComponent[] = [
    "SUBSCRIPTION_STATUS_PAYMENT_PROCESSING",
    "SUBSCRIPTION_STATUS_PAYMENT_ERROR",
    "SUBSCRIPTION_STATUS_KYC_REJECTED",
    "SUBSCRIPTION_STATUS_KYC_IN_MANUAL_REVIEW",
    "SUBSCRIPTION_STATUS_PLAN_DOWNGRADE_REQUIRED",
  ];

  return pages.includes(currentPage.value);
});

const currentPageWithCloakedPaySubscriptionEnabled = () => {
  const statusSubscriptionIntent = subscriptionStatus.value;
  const isSubscribedToCloakedPay = enabledStatus.value === "new";
  const isKycRejected =
    user.value?.kyc_limit_reached ||
    user.value?.edd_state?.behavior === EDDBehaviorEnum.REJECT_KYC;
  const wantsToUpgrade = enabledStatus.value === "new_upgrading"; // User isn't subscribed to Cloaked Pay yet

  // KYC Status

  if (!isEnabled.value && !isKycValidated.value && isKycRejected) {
    if (enabledStatus.value === "disabled") {
      return "SUBSCRIPTION_STATUS_PLAN_DOWNGRADE_REQUIRED";
    }

    return "SUBSCRIPTION_STATUS_KYC_REJECTED";
  }

  if (
    !isEnabled.value &&
    !isKycValidated.value &&
    eddState.value?.behavior === EDDBehaviorEnum.MANUAL_REVIEW
  ) {
    return "SUBSCRIPTION_STATUS_KYC_IN_MANUAL_REVIEW";
  }

  // Payment
  if (
    !isEnabled.value &&
    statusSubscriptionIntent === "kyc_approved" &&
    isKycValidated.value
  ) {
    return "SUBSCRIPTION_STATUS_PAYMENT_PROCESSING";
  }

  if (
    !isEnabled.value &&
    statusSubscriptionIntent === "payment_error" &&
    isKycValidated.value
  ) {
    return "SUBSCRIPTION_STATUS_PAYMENT_ERROR";
  }

  if (
    (!isEnabled.value && !statusSubscriptionIntent && !isUserOnboarded.value) ||
    ((isEnabled.value || wantsToUpgrade || isSubscribedToCloakedPay) &&
      !isKycValidated.value)
  ) {
    return "SUBSCRIPTION_FLOW";
  }

  if (isEnabled.value && isKycValidated.value && !isOnboardingCompleted.value) {
    return "ONBOARDING";
  }

  if (isEnabled.value && isKycValidated.value && isOnboardingCompleted.value) {
    return "WALLET";
  }

  if (
    (!isEnabled.value && isUserOnboarded.value) ||
    (enabledStatus.value === "disabled_userdowngraded" && isUserOnboarded.value)
  ) {
    return "OFFBOARDED_USER";
  }

  return "FALLBACK";
};

const currentPage = computed<WalletPageComponent | null>(() => {
  // Feature flag ENABLED flow
  if (isCloakedPaySubscriptionEnabled.value) {
    return currentPageWithCloakedPaySubscriptionEnabled();
  }

  // Feature flag DISABLED flow
  if (isEnabled.value && !isKycValidated.value) {
    return "OLD_KYC_FLOW";
  }

  if (isEnabled.value && isKycValidated.value && !isOnboardingCompleted.value) {
    return "ONBOARDING";
  }

  if (isEnabled.value && isKycValidated.value && isOnboardingCompleted.value) {
    return "WALLET";
  }

  // Waitlist and Offboarded user flow are accessible via /virtual-cards/waitlist

  return null;
});

watch(
  () => currentPage.value,
  (newPage) => {
    if (newPage === "SUBSCRIPTION_STATUS_PAYMENT_PROCESSING") {
      // Check if user state has changed in the meantime
      setTimeout(() => {
        store.dispatch("authentication/getUser");
      }, 4000);
    }
  },
  { immediate: true }
);
</script>

<template>
  <VirtualCardsSubscriptionFlow v-if="currentPage === 'SUBSCRIPTION_FLOW'" />
  <VirtualCardsSubscriptionStatus
    v-else-if="showSubscriptionStatus"
    :is-payment-processing="
      currentPage === 'SUBSCRIPTION_STATUS_PAYMENT_PROCESSING'
    "
    :is-payment-error="currentPage === 'SUBSCRIPTION_STATUS_PAYMENT_ERROR'"
    :is-kyc-rejected="currentPage === 'SUBSCRIPTION_STATUS_KYC_REJECTED'"
    :is-kyc-in-manual-review="
      currentPage === 'SUBSCRIPTION_STATUS_KYC_IN_MANUAL_REVIEW'
    "
    :is-plan-downgrade-required="
      currentPage === 'SUBSCRIPTION_STATUS_PLAN_DOWNGRADE_REQUIRED'
    "
    :manual-review-documents="eddState?.required_documents"
  />
  <KycFlow v-else-if="currentPage === 'OLD_KYC_FLOW'" />
  <PayOnboarding v-else-if="currentPage === 'ONBOARDING'" />
  <WalletActivity v-else-if="currentPage === 'WALLET'" />
  <VirtualCardsOffboardedUserSection v-if="currentPage === 'OFFBOARDED_USER'" />
  <VirtualCardsFallbackSection v-else-if="currentPage === 'FALLBACK'" />
  <!-- FF DISABLED: Waitlist and Offboarded user flow are accessible via /virtual-cards/waitlist -->
</template>
