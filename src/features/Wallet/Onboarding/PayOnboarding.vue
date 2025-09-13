<script setup lang="ts">
import { ref, computed, watch, markRaw, onMounted } from "vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import PayOnboardingProgress from "./PayOnboardingProgress.vue";
import WalletConfirmationModal from "@/features/modals/Wallet/WalletConfirmationModal.vue";
import PayOnboardingWelcomeStep1 from "./PayOnboardingWelcomeStep1.vue";
import PayOnboardingFSSetupStep2 from "./PayOnboardingFSSetupStep2.vue";
import PayOnboardingFSLinkedStep3 from "./PayOnboardingFSLinkedStep3.vue";
import PayOnboardingCardLimitStep4 from "./PayOnboardingCardLimitStep4.vue";
import PayOnboardingSuccessStep5 from "./PayOnboardingSuccessStep5.vue";
import WalletStatusSection from "@/features/Wallet/WalletStatusSection.vue";
import { useToast } from "@/composables/useToast";
import IdentityService from "@/api/actions/identity-service";
import CardsServices from "@/api/actions/cards-services";
import {
  HELP_CENTER_BASE_URL,
  NO_URL_IDENTITY_DOMAIN,
} from "@/scripts/constants";
import type { WalletStatusSectionProps } from "@/features/Wallet/WalletStatusSection.vue";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog";

const totalSteps = 5;
const { fundingSources } = useFundingSource();
const toast = useToast();
const generatedCardAmount = ref<string | null>(null);
const generatedCardLast4 = ref<string | null>(null);
const onboardingCompleted = ref<boolean>(false);
const currentStep = ref<number>(1);
const requestStatus = ref<{
  state: "LOADING" | "ERROR";
  statusSectionProps: WalletStatusSectionProps;
} | null>(null);

const fundingSource = computed(() => {
  return fundingSources.value?.[0];
});

onMounted(() => {
  // Step 1 event
  posthogCapture("dashboard_pay_post_kyc_onboarding_approved");
});

const handleStatusSecondaryBtnClick = () => {
  if (requestStatus.value?.state === "ERROR") {
    posthogCapture(
      "dashboard_pay_post_kyc_onboarding_card_error_contact_support_clicked"
    );
    window.open(HELP_CENTER_BASE_URL, "_blank");
  }
};

const handleSupportEmailCopied = () => {
  posthogCapture(
    "dashboard_pay_post_kyc_onboarding_card_error_support_email_clicked"
  );
};

const moveToNextStep = () => {
  currentStep.value++;

  if (currentStep.value === 2) {
    posthogCapture("dashboard_pay_post_kyc_onboarding_link_funding_source");
  }

  // Step 3 doesn't have a posthog event

  if (currentStep.value === 4) {
    posthogCapture("dashboard_pay_post_kyc_onboarding_set_limit");
  }

  if (currentStep.value === 5) {
    posthogCapture("dashboard_pay_post_kyc_onboarding_card_ready");
  }
};

const finishOnboarding = () => {
  onboardingCompleted.value = true;
  setTimeout(() => {
    if (store.state.authentication?.user) {
      store.state.authentication.user = {
        ...store.state.authentication.user,
        cloaked_card_post_kyc_onboarding_completed: true,
      };
      store.dispatch("authentication/getUser");
      CardsServices.getCardList();
    }
  }, 400);
};

const handleCloseOnboarding = () => {
  if (currentStep.value === totalSteps) {
    finishOnboarding();
    return;
  }

  const modalProps = {
    title: "Almost done - don't miss out.",
    description:
      "You're just a few steps away from unlocking your first private virtual card. Want to finish later or keep going?",
    primaryButtonText: "Finish Later",
    secondaryButtonText: "Keep Going",
    primaryButtonColor: "danger",
    secondaryButtonColor: "outline",
    icon: "info",
    onConfirm: () => {
      CardsServices.setOnboardingAsCompleted()
        .then(() => {
          finishOnboarding();
          posthogCapture("dashboard_pay_post_kyc_onboarding_skip_onboarding");
        })
        .catch(() => {
          toast.error("We couldn't finish your onboarding. Please try again.");
          posthogCapture(
            "dashboard_pay_post_kyc_onboarding_skip_onboarding_error"
          );
        });
    },
  };

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(WalletConfirmationModal),
      props: {
        ...modalProps,
      },
    },
  });
};

const requestCardGeneration = (amount: number) => {
  if (!fundingSource.value) {
    toast.error("Oops! Something went wrong. Please try again.");
    currentStep.value = 2;
    return;
  }

  generatedCardAmount.value = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  posthogCapture("dashboard_pay_post_kyc_onboarding_creating_card");

  requestStatus.value = {
    state: "LOADING",
    statusSectionProps: {
      title: "Creating virtual card",
      description: "Your card is almost ready to use.",
      medallion: {
        loading: true,
        size: "lg",
        color: "gray",
        icon: "info", // Not used but required by the component
      },
    },
  };

  const defaultErrorDescription =
    "Contact Cloaked Support for further assistance.";

  generateIdentity()
    .then((identityId) => {
      generateCard(identityId, amount)
        .then((response: any) => {
          generatedCardLast4.value = response?.data?.pan?.slice(-4);
        })
        .then(() => {
          CardsServices.setOnboardingAsCompleted()
            .then(() => {
              requestStatus.value = null;
              posthogCapture(
                "dashboard_pay_post_kyc_onboarding_mark_onboarding_as_completed_success"
              );
              moveToNextStep();
            })
            .catch(() => {
              toast.error(
                "We couldn't finish your onboarding. Please try again."
              );
              posthogCapture(
                "dashboard_pay_post_kyc_onboarding_mark_onboarding_as_completed_error"
              );
            });
        })
        .catch((err) => {
          const errorMessage = err?.response?.data?.message;
          const isHumanizedError = !["User has no financial-account."].includes(
            errorMessage || ""
          );
          setRequestErrorStatus(
            isHumanizedError
              ? errorMessage || defaultErrorDescription
              : defaultErrorDescription
          );
        });
    })
    .catch(() => {
      setRequestErrorStatus(defaultErrorDescription);
    });
};

const setRequestErrorStatus = (description: string) => {
  const delay = requestStatus.value?.state === "LOADING" ? 1500 : 0;

  setTimeout(() => {
    requestStatus.value = {
      state: "ERROR",
      statusSectionProps: {
        title: "There was an error getting your card.",
        description: description,
        showCopySupportEmail: true,
        medallion: {
          size: "lg",
          color: "error",
          icon: "info",
        },
        secondaryButtonText: "Contact Cloaked Support",
      },
    };
    posthogCapture("dashboard_pay_post_kyc_onboarding_card_error");
  }, delay);
};

const generateIdentity = () => {
  return IdentityService.createIdentity({
    website_url: NO_URL_IDENTITY_DOMAIN,
    nickname: "Cloak One",
    card_brand: fundingSource.value!.card_brand,
  }).then((response) => {
    return response.data.id;
  });
};

const generateCard = (identityId: string, amount: number) => {
  const requestData = {
    type: "MULTI_USE",
    currency: "usd",
    funding_source: fundingSource.value!.id,
    transaction_period_limit: amount * 100, // Format required by the API
    transaction_period: "monthly",
    valid_for_months: 24,
    transaction_period_max_transactions: 100,
  };

  return CardsServices.createIdentityCard(identityId, requestData);
};

watch(
  fundingSources,
  (fundingSources, oldFundingSources) => {
    // If the user has a funding source, move to the "Linked Step"
    if (
      fundingSources?.length &&
      fundingSources.length > 0 &&
      !oldFundingSources
    ) {
      currentStep.value = 3;
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="pay-onboarding">
    <Transition
      name="fade"
      mode="out-in"
    >
      <header
        v-if="!onboardingCompleted"
        class="pay-onboarding__header"
      >
        <PayOnboardingProgress
          :progress="(currentStep / totalSteps) * 100"
          @close="handleCloseOnboarding"
        />
      </header>
    </Transition>
    <div class="pay-onboarding__content">
      <Transition
        name="fade"
        mode="out-in"
      >
        <div v-if="onboardingCompleted"></div>
        <div
          v-else-if="requestStatus"
          class="pay-onboarding__request-status"
        >
          <WalletStatusSection
            v-bind="requestStatus.statusSectionProps"
            @secondary-button-click="handleStatusSecondaryBtnClick"
            @support-email-copied="handleSupportEmailCopied"
          />
        </div>
        <PayOnboardingWelcomeStep1
          v-else-if="currentStep === 1"
          @continue="moveToNextStep"
        />
        <PayOnboardingFSSetupStep2
          v-else-if="currentStep === 2"
          @continue="moveToNextStep"
        />
        <PayOnboardingFSLinkedStep3
          v-else-if="currentStep === 3"
          @continue="moveToNextStep"
        />
        <PayOnboardingCardLimitStep4
          v-else-if="currentStep === 4"
          @continue="requestCardGeneration"
        />
        <PayOnboardingSuccessStep5
          v-else-if="currentStep === 5"
          :card-amount="generatedCardAmount || '$ 50.00'"
          :last4="generatedCardLast4 || '1234'"
          @continue="finishOnboarding"
        />
      </Transition>
    </div>
  </div>
</template>
<style scoped lang="scss">
$component-name: "pay-onboarding";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
  height: 100%;
  width: 100%;

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__content {
    height: 100%;

    @media all and (min-width: $screen-xxl) {
      margin-top: 45px;
    }

    @media (height <= 750px) {
      margin-top: 0;
    }
  }

  &__request-status {
    height: 100%;

    @media all and (min-width: $screen-sm) {
      // Used to center the status section, due to the content margin-top
      margin-top: -25px;
    }

    @media all and (min-width: $screen-xxl) {
      // Used to center the status section, due to the content margin-top
      margin-top: -45px;
    }
  }
}

// Fade transition classes
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
