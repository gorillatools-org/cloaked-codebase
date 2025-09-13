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

const { getEddDocumentsDescriptions, getKYCStatusConfigs } = useKYC();
const router = useRouter();

const props = defineProps<{
  isPaymentProcessing?: boolean;
  isPaymentError?: boolean;
  isKycLimitReached?: boolean;
  isKycInManualReview?: boolean;
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
  if (props.isKycLimitReached) {
    return statusConfigs.MAX_ATTEMPTS_REACHED;
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

  return undefined;
});

const stateName = computed((): KYCState | undefined => {
  if (props.isKycLimitReached) {
    return "MAX_ATTEMPTS_REACHED";
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

  return undefined;
});

function handleStatusButton(action: KYCStatusButtonAction | undefined) {
  if (!action) {
    return;
  }

  const pageStateName = stateName.value?.toLowerCase() || "undefined";

  if (action === "close") {
    posthogCapture(
      `dashboard_pay_subscription_status_page_${pageStateName}_close_button_clicked`
    );
    router.push("/");
  } else if (action === "emailSupport") {
    posthogCapture(
      `dashboard_pay_subscription_status_page_${pageStateName}_contact_support_button_clicked`
    );
    openSupportLink();
  }
}

function openSupportLink() {
  const windowProxy = window.open(HELP_CENTER_BASE_URL, "_blank", "noopener");
  if (windowProxy) windowProxy.opener = null;
}

watch(
  stateName,
  (newStateName) => {
    if (newStateName) {
      posthogCapture(
        `dashboard_pay_subscription_status_page_${newStateName.toLowerCase()}_viewed`
      );
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="vc-subscription-status-section">
    <WalletStatusSection
      v-if="kycStatusSpecs"
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
