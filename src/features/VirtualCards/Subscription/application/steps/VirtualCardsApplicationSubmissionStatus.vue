<script setup lang="ts">
import { computed, watch } from "vue";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  KYCFlowEnum,
  useKYC,
  type KYCState,
  type KYCStatusButtonAction,
  type KYCStatusSpecs,
} from "@/composables/useKYC";
import WalletStatusSection from "@/features/Wallet/WalletStatusSection.vue";
import KycManualReviewDocsList from "@/features/Wallet/KycFlow/KycManualReviewDocsList.vue";
import { useVirtualCardsApplicationStore } from "@/features/VirtualCards/store/useVirtualCardsApplicationStore";
import { storeToRefs } from "pinia";

const emit = defineEmits(["tryAgain", "close"]);

const virtualCardsApplication = useVirtualCardsApplicationStore();
const { kycData, isSubscribedToCloakedPay } = storeToRefs(
  virtualCardsApplication
);

const { getEddDocumentsDescriptions } = useKYC(
  isSubscribedToCloakedPay.value
    ? KYCFlowEnum.NEW_USER_SUBSCRIPTION
    : KYCFlowEnum.EXISTING_USER_SUBSCRIPTION
);

const requiredDocumentsDescriptions = computed(() => {
  const docs = kycData.value.requiredDocuments;
  if (!docs?.length) return [];
  return getEddDocumentsDescriptions(docs) ?? [];
});

const kycStatus = computed<KYCStatusSpecs>(() => {
  if (kycData.value.kycFailureStatus && !kycData.value.isSubmitting) {
    return kycData.value.kycFailureStatus;
  }

  const loadingStatus: KYCStatusSpecs = {
    state: "LOADING",
    statusSectionProps: {
      title: "Verifying your information",
      description: "This will only take a moment.",
      medallion: {
        loading: true,
        size: "lg",
        color: "gray",
        icon: "info", // Not used but required by the component
      },
    },
  };

  return loadingStatus;
});

function handleKYCButton(action: KYCStatusButtonAction | undefined) {
  if (!action) {
    return;
  }

  const pageStateName =
    kycData.value.kycFailureStatus?.state?.toLowerCase() || "undefined";

  if (action === "close") {
    posthogCapture(`pay_kyc_${pageStateName}_close_button_tapped`);
    emit("close");
  } else if (action === "emailSupport") {
    posthogCapture(`pay_kyc_${pageStateName}_contact_support_button_tapped`);
    openSupportLink();
  } else {
    posthogCapture(`pay_kyc_${pageStateName}_try_again_button_tapped`);
    emit("tryAgain");
  }
}

function openSupportLink() {
  const windowProxy = window.open(HELP_CENTER_BASE_URL, "_blank", "noopener");
  if (windowProxy) windowProxy.opener = null;
}

watch(
  () => kycStatus.value.state,
  (state: KYCState | undefined) => {
    posthogCapture(`pay_kyc_${(state || "loading").toLowerCase()}_screenview`);
  },
  { immediate: true }
);
</script>

<template>
  <div class="vc-application-submission-status">
    <WalletStatusSection
      v-bind="kycStatus.statusSectionProps"
      :description-max-width="550"
      :full-height-content="kycStatus.state === 'MANUAL_REVIEW'"
      @primary-button-click="handleKYCButton(kycStatus?.primaryButtonAction)"
      @secondary-button-click="
        handleKYCButton(kycStatus?.secondaryButtonAction)
      "
    >
      <template #content>
        <KycManualReviewDocsList
          v-if="kycStatus.state === 'MANUAL_REVIEW'"
          :documents="requiredDocumentsDescriptions"
        />
      </template>
    </WalletStatusSection>
  </div>
</template>

<style scoped lang="scss">
$component-name: "vc-application-submission-status";

.#{$component-name} {
  height: 100%;
  padding: 10px 0;
}
</style>
