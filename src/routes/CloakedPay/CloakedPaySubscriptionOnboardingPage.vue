<script lang="ts" setup>
import {
  computed,
  reactive,
  ref,
  useTemplateRef,
  onMounted,
  onUnmounted,
} from "vue";
import SubscriptionOnboardingWelcome from "@/features/Subscription/onboarding/steps/SubscriptionOnboardingWelcome.vue";
import SubscriptionOnboardingCloakedPayForm from "@/features/Subscription/onboarding/steps/SubscriptionOnboardingCloakedPayForm.vue";
import SubscriptionOnboardingCloakedPayReview from "@/features/Subscription/onboarding/steps/SubscriptionOnboardingCloakedPayReview.vue";
import SubscriptionOnboardingCloakedPayAgreements from "@/features/Subscription/onboarding/steps/SubscriptionOnboardingCloakedPayAgreements.vue";
import SubscriptionOnboardingCloakedPayStatus from "@/features/Subscription/onboarding/steps/SubscriptionOnboardingCloakedPayStatus.vue";
import SubscriptionOnboardingCloakedPaySuccess from "@/features/Subscription/onboarding/steps/SubscriptionOnboardingCloakedPaySuccess.vue";
import SubscriptionOnboardingDataDeletionForm from "@/features/Subscription/onboarding/steps/SubscriptionOnboardingDataDeletionForm.vue";
import SubscriptionOnboardingSuccess from "@/features/Subscription/onboarding/steps/SubscriptionOnboardingSuccess.vue";
import SubscriptionOnboardingLayout from "@/features/Subscription/onboarding/SubscriptionOnboardingLayout.vue";
import type { LayoutProgressStep } from "@/features/Subscription/onboarding/SubscriptionOnboardingLayout.vue";
import type { EDDBehaviorEnum } from "@/types/Wallet/kyc";
import { KYCFlowEnum, type KYCStatusSpecs, useKYC } from "@/composables/useKYC";
import type { ProfileFormData } from "@/features/VirtualCards/Subscription/application/VirtualCardsProfileForm.vue";
import moment from "moment";
import CardsServices from "@/api/actions/cards-services";
import DataDeleteService from "@/api/actions/data-delete-service";
import { toApiPayload } from "@/features/enrollment/data-utils";
import { useToast } from "@/composables/useToast";
import type { DataDeletionFormData } from "@/features/Subscription/onboarding/steps/SubscriptionOnboardingDataDeletionForm.vue";
import UserService from "@/api/actions/user-service";
import { HAS_EXITED_DELETE_FLOW } from "@/scripts/userFlags";
import store from "@/store";
import BaseIcon from "@/library/BaseIcon.vue";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";
import { posthogCapture } from "@/scripts/posthog.js";

type StepSection =
  | "welcome"
  | "cloaked-pay-application"
  | "cloaked-pay-review"
  | "cloaked-pay-agreements"
  | "cloaked-pay-status"
  | "cloaked-pay-onboarding"
  | "data-deletion-application"
  | "success";

enum ProgressStepId {
  CREATE_ACCOUNT = "CREATE_ACCOUNT",
  CLOAKED_PAY = "CLOAKED_PAY",
  COMPLETE_PROFILE = "COMPLETE_PROFILE",
}

type KYCData = {
  requiredDocuments: string[];
  eddBehavior: EDDBehaviorEnum | null;
  kycFailureStatus: KYCStatusSpecs | null;
  isSubmitting: boolean;
};

type DetailsFormData = ProfileFormData & {
  ssn: string;
  agreementsAccepted: boolean;
};

const isCloakedPayEnabled = ref(false);
const { getKYCFailureMessage } = useKYC(KYCFlowEnum.NEW_USER_SUBSCRIPTION);

const isSubmittingDataDeletionForm = ref(false);
const toast = useToast();

const layoutRef =
  useTemplateRef<typeof SubscriptionOnboardingLayout>("layoutRef");
const currentSection = ref<StepSection>("welcome");
const progressSteps: LayoutProgressStep[] = [
  {
    id: ProgressStepId.CREATE_ACCOUNT,
    label: "Create Account",
    status: "completed",
  },
  {
    id: ProgressStepId.CLOAKED_PAY,
    label: "Cloaked Pay",
    status: "pending",
    activeOnSections: [
      "cloaked-pay-application",
      "cloaked-pay-review",
      "cloaked-pay-agreements",
      "cloaked-pay-status",
    ],
    completedOnSections: [
      "cloaked-pay-onboarding",
      "data-deletion-application",
      "success",
    ],
  },
  {
    id: ProgressStepId.COMPLETE_PROFILE,
    label: "Complete Profile",
    status: "pending",
    activeOnSections: ["data-deletion-application"],
    completedOnSections: ["success"],
  },
];

const cloakedPayFormData = reactive<DetailsFormData>({
  firstName: "",
  lastName: "",
  dob: "",
  address: {
    address1: "",
    address2: null,
    postal_code: "",
    city: "",
    state: "",
    country: "",
  },
  phone: "",
  email: "",
  ssn: "",
  agreementsAccepted: false,
});

const kycData = reactive<KYCData>({
  requiredDocuments: [],
  eddBehavior: null,
  kycFailureStatus: null,
  isSubmitting: false,
});

const eventKeyMap: Record<StepSection, string> = {
  welcome: "welcome",
  "cloaked-pay-application": "kyc_form",
  "cloaked-pay-review": "kyc_review",
  "cloaked-pay-agreements": "agreements",
  "cloaked-pay-status": "kyc_status",
  "cloaked-pay-onboarding": "post_kyc_onboarding",
  "data-deletion-application": "data_deletion_form",
  success: "success",
};

onMounted(() => {
  captureSectionScreenview(currentSection.value);
});

onUnmounted(() => {
  store.dispatch("cloakedPayOnboarding/disableOnboarding");
});

const isBackBtnDisabled = computed(() => {
  // Welcome step
  if (currentSection.value === "welcome") {
    return true;
  }

  // KYC status
  if (currentSection.value === "cloaked-pay-status") {
    return true;
  }

  // User already approved for Cloaked Pay
  if (
    currentSection.value === "cloaked-pay-onboarding" &&
    isCloakedPayEnabled.value
  ) {
    return true;
  }

  // User downgraded plan
  if (
    currentSection.value === "data-deletion-application" &&
    (kycData.kycFailureStatus?.state === "MAX_ATTEMPTS_REACHED" ||
      kycData.kycFailureStatus?.state === "PENDING_KYC" ||
      kycData.kycFailureStatus?.state === "MANUAL_REVIEW" ||
      kycData.kycFailureStatus?.state === "REJECT_KYC")
  ) {
    return true;
  }

  // User already finished onboarding
  if (currentSection.value === "success") {
    return true;
  }

  return false;
});

const captureSectionScreenview = (step: StepSection) => {
  const key = eventKeyMap[step];
  posthogCapture(`pay_tof_post_checkout_pay_onboarding_${key}_screenview`);
};

function handleCloakedPayFormSave(payload: {
  formData: ProfileFormData;
  ssn: string;
}) {
  cloakedPayFormData.firstName = payload.formData.firstName;
  cloakedPayFormData.lastName = payload.formData.lastName;
  cloakedPayFormData.dob = payload.formData.dob;
  cloakedPayFormData.address = {
    ...payload.formData.address,
  };
  cloakedPayFormData.phone = payload.formData.phone;
  cloakedPayFormData.email = payload.formData.email;
  cloakedPayFormData.ssn = payload.ssn;

  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["cloaked-pay-application"]}_continue_tapped`
  );
  goToStep("cloaked-pay-review", "forward");
}

const goBack = () => {
  const key = eventKeyMap[currentSection.value];
  posthogCapture(`pay_tof_post_checkout_pay_onboarding_${key}_back_tapped`);

  switch (currentSection.value) {
    case "cloaked-pay-application":
      goToStep("welcome", "back");
      break;
    case "cloaked-pay-review":
    case "cloaked-pay-status":
      goToStep("cloaked-pay-application", "back");
      break;
    case "cloaked-pay-agreements":
      goToStep("cloaked-pay-review", "back");
      break;
    case "data-deletion-application":
      goToStep("cloaked-pay-onboarding", "back");
      break;
  }
};

const goToStep = (step: StepSection, transitionType: "forward" | "back") => {
  currentSection.value = step;
  captureSectionScreenview(step);

  if (transitionType === "forward") {
    layoutRef.value?.goForward();
  } else {
    layoutRef.value?.goBack();
  }
};

const openSupportPage = () => {
  posthogCapture("pay_tof_post_checkout_pay_onboarding_support_fab_tapped");
  const windowProxy = window.open(HELP_CENTER_BASE_URL, "_blank", "noopener");
  if (windowProxy) windowProxy.opener = null;
};

/** Data Deletion related functions */
const submitDataDeletionForm = (formData: DataDeletionFormData) => {
  isSubmittingDataDeletionForm.value = true;
  posthogCapture(
    "pay_tof_post_checkout_pay_onboarding_data_deletion_submit_tapped"
  );

  DataDeleteService.createEnrollmentData(toApiPayload(formData))
    .then(() => {
      posthogCapture(
        "pay_tof_post_checkout_pay_onboarding_data_deletion_submit_success"
      );
      store.dispatch("dataDelete/setRecentlyEnrolled", true);
      return UserService.setFlag({
        name: HAS_EXITED_DELETE_FLOW,
        value: true,
      });
    })
    .then(() => {
      goToStep("success", "forward");
    })
    .catch((error) => {
      toast.error(
        error.response?.data?.message ||
          "Error submitting data deletion profile. Please try again."
      );
      posthogCapture(
        "pay_tof_post_checkout_pay_onboarding_data_deletion_submit_failed"
      );
    })
    .finally(() => {
      isSubmittingDataDeletionForm.value = false;
    });
};

/** Cloaked Pay related functions */

const setupFirstVirtualCard = (skipWelcome: boolean = true) => {
  setTimeout(() => {
    layoutRef.value?.finish(
      `/virtual-cards${skipWelcome ? "?skipWelcome=true" : ""}`
    );
  }, 200); // Wait for the animation to finish
};

const onCloakedPayKYCSubmit = () => {
  const key = eventKeyMap[currentSection.value];
  posthogCapture(`pay_tof_post_checkout_pay_onboarding_${key}_submit_tapped`);
  cloakedPayFormData.agreementsAccepted = true;
  submitCloakedPayApplication();
};

const submitCloakedPayApplication = () => {
  const sanitizedPhoneNumber = String(cloakedPayFormData.phone || "").replace(
    /[()\s-]/g,
    ""
  );
  const sanitizedGovernmentId = String(cloakedPayFormData.ssn || "").replace(
    /\s+/g,
    ""
  );

  const payload = {
    first_name: cloakedPayFormData.firstName,
    last_name: cloakedPayFormData.lastName,
    email: cloakedPayFormData.email,
    phone_number: sanitizedPhoneNumber,
    dob: moment(cloakedPayFormData.dob, "MM/DD/YYYY").format("YYYY-MM-DD"),
    government_id: sanitizedGovernmentId,
    address: {
      street: cloakedPayFormData.address.address1,
      city: cloakedPayFormData.address.city,
      postcode: cloakedPayFormData.address.postal_code,
      state_province: cloakedPayFormData.address.state,
      country: "USA", // Only USA is supported for virtual cards
    },
  };

  kycData.isSubmitting = true;
  posthogCapture("pay_tof_post_checkout_pay_onboarding_kyc_submitted");
  goToStep("cloaked-pay-status", "forward");

  CardsServices.submitKYC(payload)
    .then(() => {
      // UX purpose
      setTimeout(() => {
        posthogCapture(
          "pay_tof_post_checkout_pay_onboarding_kyc_submission_success"
        );
        isCloakedPayEnabled.value = true;
        goToStep("cloaked-pay-onboarding", "forward");

        setTimeout(() => {
          kycData.isSubmitting = false;
        }, 300);
      }, 3000);
    })
    .catch((error) => {
      setTimeout(() => {
        kycData.isSubmitting = false;
        handleCloakedPaySubmissionError(error);
        posthogCapture(
          "pay_tof_post_checkout_pay_onboarding_kyc_submission_failed"
        );
      }, 3000);
    });
};

const handleCloakedPaySubmissionError = (errorData: any) => {
  const data = errorData?.response?.data || {};
  const edd = errorData.response?.data?.edd;

  const failureStatus = getKYCFailureMessage(data);
  kycData.kycFailureStatus = failureStatus;

  if (edd) {
    kycData.eddBehavior = edd?.behavior;
    kycData.requiredDocuments = edd?.required_documents || [];
  }
};

/* Event handlers */
const handleWelcomeContinue = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["welcome"]}_continue_tapped`
  );
  goToStep("cloaked-pay-application", "forward");
};

const handleReviewContinue = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["cloaked-pay-review"]}_continue_tapped`
  );
  goToStep("cloaked-pay-agreements", "forward");
};

const handleReviewEditDetails = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["cloaked-pay-review"]}_edit_details_tapped`
  );
  goToStep("cloaked-pay-application", "back");
};

const handleStatusPlanDowngraded = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["cloaked-pay-status"]}_plan_downgrade_success`
  );
  goToStep("data-deletion-application", "forward");
};

const handleStatusPlanDowngradedSkipped = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["cloaked-pay-status"]}_plan_downgrade_skipped`
  );
  goToStep("data-deletion-application", "forward");
};

const handleStatusContinue = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["cloaked-pay-status"]}_continue_tapped`
  );
  goToStep("data-deletion-application", "forward");
};

const handleStatusTryAgain = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["cloaked-pay-status"]}_try_again_tapped`
  );
  goToStep("cloaked-pay-application", "back");
};

const handleOnboardingFinishProfile = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["cloaked-pay-onboarding"]}_finish_profile_tapped`
  );
  goToStep("data-deletion-application", "forward");
};

const handleOnboardingSetupFirstCard = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["cloaked-pay-onboarding"]}_setup_first_card_tapped`
  );
  setupFirstVirtualCard(true);
};

const handleSuccessSetupVirtualCard = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["success"]}_setup_virtual_card_tapped`
  );
  setupFirstVirtualCard(false);
};

const handleSuccessContinue = () => {
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${eventKeyMap["success"]}_continue_tapped`
  );
  layoutRef?.value?.finish("/home");
};

const handleExitModalOpened = () => {
  const key = eventKeyMap[currentSection.value];
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${key}_exit_modal_opened`
  );
};

const handleExitModalConfirmed = () => {
  const key = eventKeyMap[currentSection.value];
  posthogCapture(
    `pay_tof_post_checkout_pay_onboarding_${key}_exit_modal_confirmed`
  );
};
</script>

<template>
  <div
    class="cloaked-pay-subs-onboarding"
    :class="`cloaked-pay-subs-onboarding--${currentSection}`"
  >
    <SubscriptionOnboardingLayout
      ref="layoutRef"
      finish-redirect-route="/virtual-cards"
      :disable-back-btn="isBackBtnDisabled"
      :disable-close-btn="false"
      :show-close-modal="currentSection !== 'success'"
      :progress-steps="progressSteps"
      :current-section="currentSection"
      :close-modal-config="{
        description:
          'You\'re just a few steps away from unlocking your first virtual card and starting your data removal process. Want to finish later or keep going?',
      }"
      @back="goBack()"
      @exit-modal-opened="handleExitModalOpened"
      @exit-modal-confirmed="handleExitModalConfirmed"
    >
      <div
        :key="currentSection"
        class="cloaked-pay-subs-onboarding__content"
        :class="{
          'cloaked-pay-subs-onboarding__content--no-padding-inline':
            currentSection === 'cloaked-pay-onboarding',
        }"
      >
        <SubscriptionOnboardingWelcome
          v-if="currentSection === 'welcome'"
          @continue="handleWelcomeContinue"
        />
        <SubscriptionOnboardingCloakedPayForm
          v-else-if="currentSection === 'cloaked-pay-application'"
          :form-data="cloakedPayFormData"
          @continue="handleCloakedPayFormSave"
        />
        <SubscriptionOnboardingCloakedPayReview
          v-else-if="currentSection === 'cloaked-pay-review'"
          :form-data="cloakedPayFormData"
          @continue="handleReviewContinue"
          @submit="onCloakedPayKYCSubmit()"
          @edit-details="handleReviewEditDetails"
        />
        <SubscriptionOnboardingCloakedPayAgreements
          v-else-if="currentSection === 'cloaked-pay-agreements'"
          @submit="onCloakedPayKYCSubmit()"
        />
        <SubscriptionOnboardingCloakedPayStatus
          v-else-if="currentSection === 'cloaked-pay-status'"
          :kyc-data="kycData"
          @plan-downgraded="handleStatusPlanDowngraded"
          @continue="handleStatusContinue"
          @try-again="handleStatusTryAgain"
          @plan-downgrade-skipped="handleStatusPlanDowngradedSkipped"
        />
        <SubscriptionOnboardingCloakedPaySuccess
          v-else-if="currentSection === 'cloaked-pay-onboarding'"
          @finish-profile="handleOnboardingFinishProfile"
          @setup-first-card="handleOnboardingSetupFirstCard"
        />
        <SubscriptionOnboardingDataDeletionForm
          v-else-if="currentSection === 'data-deletion-application'"
          :form-data="cloakedPayFormData"
          :is-submitting="isSubmittingDataDeletionForm"
          @submit="submitDataDeletionForm"
        />
        <SubscriptionOnboardingSuccess
          v-else-if="currentSection === 'success'"
          :show-set-up-virtual-card-button="isCloakedPayEnabled"
          @setup-virtual-card="handleSuccessSetupVirtualCard"
          @continue="handleSuccessContinue"
        />
      </div>
    </SubscriptionOnboardingLayout>

    <div
      class="cloaked-pay-subs-onboarding__support-fab"
      role="button"
      tabindex="0"
      @click="openSupportPage"
    >
      <BaseIcon
        name="question-mark-filled"
        class="cloaked-pay-subs-onboarding__support-fab-icon"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cloaked-pay-subs-onboarding {
  &__content {
    padding-top: 24px;
    padding-inline: 18px;
    height: 100%;

    &--no-padding-inline {
      padding-inline: unset;
    }

    @media screen and (min-width: $screen-md) {
      padding-inline: unset;
    }
  }

  &__support-fab {
    position: absolute;
    bottom: 12px;
    right: 12px;
    min-width: 35px;
    min-height: 35px;
    background-color: $color-primary-100;
    z-index: 1000;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    visibility: visible;
    opacity: 1;
    transition:
      transform 0.3s ease,
      opacity 0.1s ease,
      visibility 0.1s ease,
      bottom 0.3s ease,
      right 0.3s ease;

    &:hover {
      transform: scale(1.03) translateY(-5px);
    }

    .cloaked-pay-subs-onboarding--cloaked-pay-application &,
    .cloaked-pay-subs-onboarding--data-deletion-application & {
      bottom: 105px;
      right: 12px;

      @media screen and (min-width: $screen-md) {
        bottom: 24px;
        right: 24px;
      }
    }

    .cloaked-pay-subs-onboarding--cloaked-pay-agreements & {
      bottom: 70px;
      right: 12px;

      @media screen and (min-width: $screen-md) {
        bottom: 24px;
        right: 24px;
      }
    }

    .cloaked-pay-subs-onboarding--cloaked-pay-application:focus-within &,
    .cloaked-pay-subs-onboarding--data-deletion-application:focus-within &,
    .cloaked-pay-subs-onboarding--cloaked-pay-agreements:focus-within & {
      opacity: 0;
      visibility: hidden;

      @media screen and (min-width: $screen-md) {
        visibility: visible;
        opacity: 1;
      }
    }

    @media screen and (min-width: $screen-md) {
      bottom: 24px;
      right: 24px;
      min-width: 40px;
      min-height: 40px;
    }

    &-icon {
      font-size: 24px;
      color: $color-base-white-100;
    }
  }
}
</style>
