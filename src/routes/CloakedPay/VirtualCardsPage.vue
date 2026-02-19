<script setup lang="ts">
import { computed, onMounted, watch, ref } from "vue";
import store from "@/store";
import KycFlow from "@/features/Wallet/KycFlow.vue";
import PayOnboarding from "@/features/Wallet/Onboarding/PayOnboarding.vue";
import VirtualCardsSubscriptionFlow from "@/features/VirtualCards/Subscription/VirtualCardsSubscriptionFlow.vue";
import VirtualCardsOffboardedUserSection from "@/features/VirtualCards/Sections/VirtualCardsOffboardedUserSection.vue";
import VirtualCardsSubscriptionStatus from "@/features/VirtualCards/Sections/VirtualCardsSubscriptionStatusSection.vue";
import VirtualCardsFallbackSection from "@/features/VirtualCards/Sections/VirtualCardsFallbackSection.vue";
import { EDDBehaviorEnum } from "@/types/Wallet/kyc";
import { useRouter, useRoute } from "vue-router";
import { useCloakedPaySubscription } from "@/features/VirtualCards/composables/useCloakedPaySubscription.ts";
import { useCloakedPayUser } from "@/features/VirtualCards/composables/useCloakedPayUser.ts";

type WalletPageComponent =
  | "SUBSCRIPTION_FLOW"
  | "SUBSCRIPTION_STATUS_PAYMENT_PROCESSING"
  | "SUBSCRIPTION_STATUS_PAYMENT_ERROR"
  | "SUBSCRIPTION_STATUS_KYC_REJECTED"
  | "SUBSCRIPTION_STATUS_KYC_IN_MANUAL_REVIEW"
  | "SUBSCRIPTION_STATUS_PLAN_DOWNGRADE_REQUIRED"
  | "SUBSCRIPTION_STATUS_KYC_PENDING"
  | "ONBOARDING"
  | "WALLET"
  | "OFFBOARDED_USER"
  | "OFFBOARDED_USER_DOWNGRADED"
  | "FALLBACK"
  | "OLD_KYC_FLOW";

const {
  isEnabled,
  isKycValidated,
  isOnboardingCompleted,
  eddState,
  enabledStatus,
  subscriptionStatus,
  isKycRejected,
} = useCloakedPayUser();

const { isCloakedPaySubscriptionEnabled } = useCloakedPaySubscription();
const router = useRouter();
const route = useRoute();
const isRestartingSubscription = ref(false);

onMounted(() => {
  store.dispatch("authentication/getUser");
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
    "SUBSCRIPTION_STATUS_KYC_PENDING",
  ];

  return pages.includes(currentPage.value);
});

const currentPageWithCloakedPaySubscriptionEnabled = () => {
  const status = enabledStatus.value;
  const subscriptionIntentStatus = subscriptionStatus.value;

  const hasUserBeenEnabledBefore =
    status !== null && status !== "new" && status !== "new_upgrading";

  // 1. Legacy KYC flow: Enabled but not validated (existing users upgrading)
  if (isEnabled.value && !isKycValidated.value) {
    return "OLD_KYC_FLOW";
  }

  // 2. Restarting subscription: Downgraded user restarting
  if (status === "disabled_userdowngraded" && isRestartingSubscription.value) {
    return "SUBSCRIPTION_FLOW";
  }

  // 3. KYC error states: Not enabled and not validated
  if (!isEnabled.value && !isKycValidated.value) {
    if (isKycRejected.value) {
      return status === "disabled" || status === "new"
        ? "SUBSCRIPTION_STATUS_PLAN_DOWNGRADE_REQUIRED"
        : "SUBSCRIPTION_STATUS_KYC_REJECTED";
    }
    if (eddState.value?.behavior === EDDBehaviorEnum.MANUAL_REVIEW) {
      return "SUBSCRIPTION_STATUS_KYC_IN_MANUAL_REVIEW";
    }
    if (eddState.value?.behavior === EDDBehaviorEnum.PENDING_KYC) {
      return "SUBSCRIPTION_STATUS_KYC_PENDING";
    }
  }

  // 4. Payment states: Not enabled but validated
  if (!isEnabled.value && isKycValidated.value) {
    if (subscriptionIntentStatus === "kyc_approved") {
      return "SUBSCRIPTION_STATUS_PAYMENT_PROCESSING";
    }
    if (subscriptionIntentStatus === "payment_error") {
      return "SUBSCRIPTION_STATUS_PAYMENT_ERROR";
    }
  }

  // 5. Active user states: Enabled and validated
  if (isEnabled.value && isKycValidated.value) {
    return !isOnboardingCompleted.value ? "ONBOARDING" : "WALLET";
  }

  // 6. Subscription flow: New users or users needing subscription
  // Note: enabled users without KYC are handled by OLD_KYC_FLOW above
  if (
    (!isEnabled.value && !hasUserBeenEnabledBefore) ||
    ((status === "new_upgrading" || status === "new") && !isKycValidated.value)
  ) {
    return "SUBSCRIPTION_FLOW";
  }

  // 7. Offboarded states
  if (status === "disabled_userdowngraded") {
    return "OFFBOARDED_USER_DOWNGRADED";
  }
  if (!isEnabled.value && hasUserBeenEnabledBefore) {
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
  [() => currentPage.value, () => route.name],
  ([newPage, routeName]) => {
    if (newPage === "SUBSCRIPTION_STATUS_PAYMENT_PROCESSING") {
      // Check if user state has changed in the meantime
      setTimeout(() => {
        store.dispatch("authentication/getUser");
      }, 4000);
    }

    // Redirect to index page if user is not on index page and current page is not wallet
    if (newPage !== "WALLET" && routeName !== "VirtualCardsIndex") {
      router.replace({
        name: "VirtualCardsIndex",
        query: route.query,
      });
    }

    // Redirect to wallet page if user is on virtual cards index page and current page is wallet
    if (newPage === "WALLET" && routeName === "VirtualCardsIndex") {
      router.replace({
        name: "VirtualCardsWalletIndex",
        query: route.query,
      });
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
    :is-kyc-pending="currentPage === 'SUBSCRIPTION_STATUS_KYC_PENDING'"
    :manual-review-documents="eddState?.required_documents"
  />
  <KycFlow v-else-if="currentPage === 'OLD_KYC_FLOW'" />
  <PayOnboarding v-else-if="currentPage === 'ONBOARDING'" />
  <VirtualCardsOffboardedUserSection
    v-else-if="
      currentPage === 'OFFBOARDED_USER' ||
      currentPage === 'OFFBOARDED_USER_DOWNGRADED'
    "
    :is-disabled-downgraded="currentPage === 'OFFBOARDED_USER_DOWNGRADED'"
    @restart-subscription="isRestartingSubscription = true"
  />
  <VirtualCardsFallbackSection v-else-if="currentPage === 'FALLBACK'" />
  <router-view v-else />
  <!-- FF DISABLED: Waitlist and Offboarded user flow are accessible via /virtual-cards/waitlist -->
</template>
