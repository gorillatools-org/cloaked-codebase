<script setup lang="ts">
import { computed, watch } from "vue";
import {
  useKYC,
  type KYCState,
  type KYCStatusButtonAction,
  type KYCStatusSpecs,
} from "@/composables/useKYC";
import WalletStatusSection from "@/features/Wallet/WalletStatusSection.vue";
import BaseButton from "@/library/BaseButton.vue";
import KycManualReviewDocsList from "@/features/Wallet/KycFlow/KycManualReviewDocsList.vue";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";
import VirtualCardsSubscriptionDowngrade from "@/features/VirtualCards/Subscription/application/VirtualCardsSubscriptionDowngrade.vue";
import { posthogCapture } from "@/scripts/posthog.js";

const emit = defineEmits([
  "tryAgain",
  "planDowngraded",
  "continue",
  "planDowngradeSkipped",
]);

const props = defineProps<{
  kycData: {
    requiredDocuments: string[];
    kycFailureStatus: KYCStatusSpecs | null;
    isSubmitting: boolean;
  };
}>();

const { getEddDocumentsDescriptions } = useKYC();

const requiredDocumentsDescriptions = computed(() => {
  const docs = props.kycData?.requiredDocuments;
  if (!docs?.length) return [];
  return getEddDocumentsDescriptions(docs) ?? [];
});

const kycStatus = computed<KYCStatusSpecs>(() => {
  if (props.kycData?.kycFailureStatus && !props.kycData?.isSubmitting) {
    return props.kycData.kycFailureStatus as KYCStatusSpecs;
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

function onDowngradedPlan() {
  setTimeout(() => {
    emit("planDowngraded");
  }, 1000); // UX purpose - Wait until modal is closed
}

function handleKYCButton(action: KYCStatusButtonAction | undefined) {
  if (!action) {
    return;
  }

  const pageStateName =
    props.kycData.kycFailureStatus?.state?.toLowerCase() || "undefined";

  if (action === "close") {
    posthogCapture(
      `pay_tof_post_checkout_pay_onboarding_kyc_status_${pageStateName}_continue_to_next_step_button_tapped`
    );
    emit("continue");
  } else if (action === "emailSupport") {
    posthogCapture(
      `pay_tof_post_checkout_pay_onboarding_kyc_status_${pageStateName}_contact_support_button_tapped`
    );
    openSupportLink();
  } else {
    posthogCapture(
      `pay_tof_post_checkout_pay_onboarding_kyc_status_${pageStateName}_try_again_button_tapped`
    );
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
    posthogCapture(
      `pay_tof_post_checkout_pay_onboarding_kyc_status_${(state || "loading").toLowerCase()}_screenview`
    );
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="subs-onboarding-pay-status"
    :class="`subs-onboarding-pay-status--${kycStatus.state}`"
  >
    <WalletStatusSection
      v-bind="
        kycStatus.state === 'MAX_ATTEMPTS_REACHED' ||
        kycStatus.state === 'REJECT_KYC'
          ? {}
          : kycStatus.statusSectionProps
      "
      :description-max-width="550"
      :full-height-content="
        kycStatus.state === 'MAX_ATTEMPTS_REACHED' ||
        kycStatus.state === 'REJECT_KYC' ||
        kycStatus.state === 'MANUAL_REVIEW'
      "
      @primary-button-click="handleKYCButton(kycStatus?.primaryButtonAction)"
      @secondary-button-click="
        handleKYCButton(kycStatus?.secondaryButtonAction)
      "
    >
      <template #content>
        <VirtualCardsSubscriptionDowngrade
          v-if="
            kycStatus.state === 'MAX_ATTEMPTS_REACHED' ||
            kycStatus.state === 'REJECT_KYC'
          "
          @plan-downgraded="onDowngradedPlan"
        >
          <template #after-actions>
            <div class="subs-onboarding-pay-status__downgrade-actions">
              <BaseButton
                variant="secondary"
                size="md"
                full-width
                icon="arrow-right"
                class="vc-subs-downgrade__actions-button"
                @click="emit('planDowngradeSkipped')"
              >
                Finish profile
              </BaseButton>
            </div>
          </template>
        </VirtualCardsSubscriptionDowngrade>
        <KycManualReviewDocsList
          v-if="kycStatus.state === 'MANUAL_REVIEW'"
          :documents="requiredDocumentsDescriptions"
        >
          <template #extra-actions>
            <BaseButton
              variant="secondary"
              icon="arrow-right"
              style="width: 100%"
              @click="handleKYCButton('close')"
            >
              Finish profile
            </BaseButton>
          </template>
        </KycManualReviewDocsList>
      </template>
    </WalletStatusSection>
  </div>
</template>

<style scoped lang="scss">
.subs-onboarding-pay-status {
  height: 100%;
  padding-inline: 12px;

  &--MAX_ATTEMPTS_REACHED,
  &--REJECT_KYC {
    height: auto;

    @media screen and (min-width: $screen-md) {
      height: 100%;
    }
  }

  &__downgrade-actions {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  &__continue-link {
    margin-top: 8px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    opacity: 1;
    background: transparent;
    border: none;
    color: $color-primary-100;
    cursor: pointer;
    padding: 0;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
