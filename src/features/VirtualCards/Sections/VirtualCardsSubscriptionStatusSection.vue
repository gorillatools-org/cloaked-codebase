<script setup lang="ts">
import { computed, watch } from "vue";
import {
  type KYCStatusButtonAction,
  useKYC,
  type KYCState,
} from "@/composables/useKYC";
import KycManualReviewDocsList from "@/features/Wallet/KycFlow/KycManualReviewDocsList.vue";
import { useRouter } from "vue-router";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";
import { posthogCapture } from "@/scripts/posthog.js";
import WalletStatusSection from "@/features/Wallet/WalletStatusSection.vue";
import VirtualCardsSubscriptionDowngrade from "@/features/VirtualCards/Subscription/application/VirtualCardsSubscriptionDowngrade.vue";
import store from "@/store";

const { getEddDocumentsDescriptions, getKYCStatusConfigs } = useKYC();
const router = useRouter();

const props = defineProps<{
  isPaymentProcessing?: boolean;
  isPaymentError?: boolean;
  isKycRejected?: boolean;
  isKycInManualReview?: boolean;
  isPlanDowngradeRequired?: boolean;
  isKycPending?: boolean;
  manualReviewDocuments?: string[];
}>();

const manualReviewDocumentsDescriptions = computed(() => {
  if (props.manualReviewDocuments?.length === 0) {
    return [];
  }

  return getEddDocumentsDescriptions(props.manualReviewDocuments || []);
});

const kycStatusSpecs = computed(() => {
  const statusConfigs = getKYCStatusConfigs();
  if (props.isKycRejected) {
    return statusConfigs.REJECT_KYC;
  }

  if (props.isKycInManualReview) {
    return statusConfigs.MANUAL_REVIEW;
  }

  if (props.isPaymentProcessing) {
    return statusConfigs.PAYMENT_PROCESSING;
  }

  if (props.isPaymentError) {
    return statusConfigs.PAYMENT_ERROR;
  }

  if (props.isKycPending) {
    return statusConfigs.PENDING_KYC;
  }

  return undefined;
});

const stateName = computed((): KYCState | undefined | string => {
  if (props.isKycRejected) {
    return "REJECT_KYC";
  }

  if (props.isKycInManualReview) {
    return "MANUAL_REVIEW";
  }

  if (props.isPaymentProcessing) {
    return "PAYMENT_PROCESSING";
  }

  if (props.isPaymentError) {
    return "PAYMENT_ERROR";
  }

  if (props.isPlanDowngradeRequired) {
    return "PLAN_DOWNGRADE_REQUIRED";
  }

  if (props.isKycPending) {
    return "PENDING_KYC";
  }

  return undefined;
});

function handleStatusButton(action: KYCStatusButtonAction | undefined) {
  if (!action) {
    return;
  }

  const pageStateName = stateName.value?.toLowerCase() || "undefined";

  if (action === "close") {
    posthogCapture(
      `pay_subscription_status_page_${pageStateName}_close_button_tapped`
    );
    router.push("/");
  } else if (action === "emailSupport") {
    posthogCapture(
      `pay_subscription_status_page_${pageStateName}_contact_support_button_tapped`
    );
    openSupportLink();
  }
}

function openSupportLink() {
  const windowProxy = window.open(HELP_CENTER_BASE_URL, "_blank", "noopener");
  if (windowProxy) windowProxy.opener = null;
}

function onDowngradedPlan() {
  // Force a refresh of the user to get the updated user state
  store.dispatch("authentication/getUser");
}

watch(
  stateName,
  (newStateName) => {
    if (newStateName) {
      posthogCapture(
        `pay_subscription_status_page_${newStateName.toLowerCase()}_viewed`
      );
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="vc-subscription-status-section">
    <WalletStatusSection
      v-if="kycStatusSpecs || isPlanDowngradeRequired"
      v-bind="kycStatusSpecs?.statusSectionProps"
      :description-max-width="550"
      @primary-button-click="
        handleStatusButton(kycStatusSpecs?.primaryButtonAction)
      "
      @secondary-button-click="
        handleStatusButton(kycStatusSpecs?.secondaryButtonAction)
      "
    >
      <template #content>
        <KycManualReviewDocsList
          v-if="isKycInManualReview"
          :documents="manualReviewDocumentsDescriptions"
        />
        <VirtualCardsSubscriptionDowngrade
          v-if="isPlanDowngradeRequired"
          @plan-downgraded="onDowngradedPlan"
        />
      </template>
    </WalletStatusSection>
  </div>
</template>

<style scoped lang="scss">
$component-name: "vc-subscription-status-section";

.#{$component-name} {
  height: 100%;
}
</style>
