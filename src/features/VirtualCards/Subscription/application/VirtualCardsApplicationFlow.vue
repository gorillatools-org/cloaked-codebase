<script lang="ts" setup>
import BaseIcon from "@/library/BaseIcon.vue";
import VirtualCardsApplicationProgress from "./VirtualCardsApplicationProgress.vue";
import VirtualCardsApplicationUpgradePlan from "./steps/VirtualCardsApplicationUpgradePlan.vue";
import VirtualCardsApplicationDetailsForm from "./steps/VirtualCardsApplicationDetailsForm.vue";
import VirtualCardsApplicationSSNForm from "./steps/VirtualCardsApplicationSSNForm.vue";
import VirtualCardsSubscriptionProfileReview from "./steps/VirtualCardsSubscriptionProfileReview.vue";
import VirtualCardsApplicationAgreements from "./steps/VirtualCardsApplicationAgreements.vue";
import VirtualCardsApplicationSubmissionStatus from "./steps/VirtualCardsApplicationSubmissionStatus.vue";
import { onBeforeMount, computed, ref, useTemplateRef, watch } from "vue";
import { storeToRefs } from "pinia";
import { useVirtualCardsApplicationStore } from "@/features/VirtualCards/store/useVirtualCardsApplicationStore";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { posthogCapture } from "@/scripts/posthog.js";
import store from "@/store";

const router = useRouter();
const contentRef = useTemplateRef<HTMLElement>("contentRef");
const virtualCardsApplication = useVirtualCardsApplicationStore();
const {
  currentApplicationSection,
  detailsFormData,
  kycData,
  steps,
  applicationSectionTransition,
  isApplicationDone,
  isSubscribedToCloakedPay,
} = storeToRefs(virtualCardsApplication);
const {
  goBack,
  submitApplication,
  openFinishApplicationFlowModal,
  goToDetailsForm,
  goToSSNForm,
  goToProfileReview,
  goToAgreements,
  restartApplicationFlow,
} = virtualCardsApplication;

// Intercept route changes to confirm leaving the flow
const hasConfirmedNavigationAway = ref(false);

onBeforeMount(() => {
  if (isSubscribedToCloakedPay.value) {
    goToDetailsForm();
  }
});

onBeforeRouteLeave((to) => {
  if (hasConfirmedNavigationAway.value || isApplicationDone.value) {
    return true;
  }

  posthogCapture(`pay_kyc_before_route_leave_exit_confirm_screenview`);
  openFinishApplicationFlowModal(() => {
    posthogCapture(`pay_kyc_before_route_leave_exit_confirm_yes_finish_tapped`);
    hasConfirmedNavigationAway.value = true;
    router.push(to.fullPath);
  });

  return false;
});

const isAgreementsAccepted = computed(() => {
  return detailsFormData.value.agreementsAccepted;
});

const isSubmitting = computed(() => {
  return kycData.value.isSubmitting;
});

const isBackButtonDisabled = computed(() => {
  return (
    isSubmitting.value ||
    isApplicationDone.value ||
    kycData.value.kycFailureStatus?.state === "REJECT_KYC" ||
    kycData.value.kycFailureStatus?.state === "MANUAL_REVIEW" ||
    kycData.value.kycFailureStatus?.state === "MAX_ATTEMPTS_REACHED" ||
    kycData.value.kycFailureStatus?.state === "PAYMENT_PROCESSING" ||
    kycData.value.kycFailureStatus?.state === "LOADING" ||
    kycData.value.kycFailureStatus?.state === "PENDING"
  );
});

const scrollToTop = () => {
  contentRef.value?.scrollTo({ top: 0 });
};

const handleCloseBtnClick = () => {
  let eventName = "";
  if (currentApplicationSection.value === "upgrade-plan") {
    eventName = "pay_kyc_confirm_plan";
  } else if (currentApplicationSection.value === "details-form") {
    eventName = "pay_kyc_details_form";
  } else if (currentApplicationSection.value === "ssn-form") {
    eventName = "pay_kyc_ssn_form";
  } else if (currentApplicationSection.value === "profile-review") {
    eventName = "pay_kyc_review_profile";
  } else if (currentApplicationSection.value === "agreements") {
    eventName = "pay_kyc_agreements";
  } else if (currentApplicationSection.value === "submission-status") {
    eventName = "pay_kyc_submission_status";
  }

  posthogCapture(`${eventName}_close_tapped`);

  const failureStatus = kycData.value.kycFailureStatus?.state;
  if (
    failureStatus === "MAX_ATTEMPTS_REACHED" ||
    failureStatus === "PAYMENT_PROCESSING" ||
    failureStatus === "PENDING" ||
    failureStatus === "MANUAL_REVIEW" ||
    failureStatus === "REJECT_KYC"
  ) {
    store.dispatch("authentication/getUser").then(() => {
      posthogCapture(`${eventName}_exit_confirm_finish_tapped`);
      restartApplicationFlow();
    });
    return;
  }

  posthogCapture(`pay_kyc_exit_confirm_screenview`);

  openFinishApplicationFlowModal(() => {
    posthogCapture(`${eventName}_exit_confirm_finish_tapped`);
    restartApplicationFlow();
  });
};

const handleBackBtnClick = () => {
  if (currentApplicationSection.value === "upgrade-plan") {
    posthogCapture("pay_kyc_confirm_plan_back_tapped");
  } else if (currentApplicationSection.value === "details-form") {
    posthogCapture("pay_kyc_details_form_back_tapped");
  } else if (currentApplicationSection.value === "ssn-form") {
    posthogCapture("pay_kyc_ssn_form_back_tapped");
  } else if (currentApplicationSection.value === "profile-review") {
    posthogCapture("pay_kyc_review_profile_back_tapped");
  } else if (currentApplicationSection.value === "agreements") {
    posthogCapture("pay_kyc_agreements_back_tapped");
  } else if (currentApplicationSection.value === "submission-status") {
    posthogCapture("pay_kyc_submission_status_back_tapped");
  }

  goBack();
};

const handleProfileReviewContinue = () => {
  if (isAgreementsAccepted.value) {
    submitApplication();
    return;
  }
  goToAgreements();
};

const handleSubmitApplication = () => {
  detailsFormData.value.agreementsAccepted = true;
  submitApplication();
};

const handleCloseSubmissionStatus = () => {
  hasConfirmedNavigationAway.value = true;
  restartApplicationFlow();
  router.push("/");
};

watch(currentApplicationSection, () => {
  // Wait for the section to transition out to prevent the scroll animation
  // from breaking the visual appearance of the smooth transition
  setTimeout(() => {
    scrollToTop();
  }, 170);
});
</script>

<template>
  <div class="vc-application-flow">
    <header class="vc-application-flow__header">
      <BaseIcon
        role="button"
        tabindex="0"
        aria-label="Back"
        name="chevron-left"
        class="vc-application-flow__header-back"
        :class="{
          'vc-application-flow__header-back--disabled': isBackButtonDisabled,
        }"
        @click="handleBackBtnClick"
        @keydown.enter="handleBackBtnClick"
        @keydown.space.prevent="handleBackBtnClick"
      />
      <VirtualCardsApplicationProgress
        class="vc-application-flow__header-progress"
        :steps="steps"
      />
      <BaseIcon
        role="button"
        tabindex="0"
        aria-label="Close"
        name="close"
        class="vc-application-flow__header-close"
        :class="{ 'vc-application-flow__header-close--disabled': isSubmitting }"
        @click="handleCloseBtnClick"
        @keydown.enter="handleCloseBtnClick"
        @keydown.space.prevent="handleCloseBtnClick"
      />
    </header>
    <div
      id="vc-application-flow-content"
      ref="contentRef"
      class="vc-application-flow__content"
    >
      <Transition
        :name="
          applicationSectionTransition === 'forward'
            ? 'step-forward'
            : 'step-back'
        "
        mode="out-in"
      >
        <VirtualCardsApplicationUpgradePlan
          v-if="currentApplicationSection === 'upgrade-plan'"
          @confirm="goToDetailsForm"
        />
        <VirtualCardsApplicationDetailsForm
          v-else-if="currentApplicationSection === 'details-form'"
          @continue="goToSSNForm"
        />
        <VirtualCardsApplicationSSNForm
          v-else-if="currentApplicationSection === 'ssn-form'"
          @continue="goToProfileReview"
        />
        <VirtualCardsSubscriptionProfileReview
          v-else-if="currentApplicationSection === 'profile-review'"
          @continue="handleProfileReviewContinue"
          @edit-details="goToDetailsForm('back')"
        />
        <VirtualCardsApplicationAgreements
          v-else-if="currentApplicationSection === 'agreements'"
          @submit="handleSubmitApplication"
        />
        <VirtualCardsApplicationSubmissionStatus
          v-else-if="currentApplicationSection === 'submission-status'"
          @try-again="goToDetailsForm('back')"
          @close="handleCloseSubmissionStatus"
        />
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "vc-application-flow";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 16px 20px;
  position: relative;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent;
    width: 100%;
    gap: 26px;

    @media (min-width: $screen-md) {
      gap: 0;
    }

    &-back,
    &-close {
      font-size: 24px;
      color: $color-primary-100;
      cursor: pointer;
      transition: opacity 0.12s ease-in-out;

      &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      &:hover:not(&--disabled) {
        opacity: 0.8;
      }
    }

    &-progress {
      width: 100%;
      margin-right: 18px;

      @media (min-width: $screen-md) {
        width: 300px;
        margin-right: 26px;
      }
    }
  }

  &__content {
    width: 100%;
    height: 100%;
    margin-top: 43px;
    padding-bottom: 10px;
    overflow-x: hidden;

    @media (height >=750px) {
      margin-top: 68px;
    }
  }
}

.step-forward-enter-active,
.step-forward-leave-active,
.step-back-enter-active,
.step-back-leave-active {
  transition:
    transform 200ms cubic-bezier(0.77, 0, 0.18, 1),
    opacity 200ms cubic-bezier(0.77, 0, 0.18, 1),
    filter 150ms cubic-bezier(0.77, 0, 0.18, 1);
}

.step-forward-enter-from {
  opacity: 0;
  transform: translateX(24px);
  filter: blur(2px);
}

.step-forward-enter-to {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.step-forward-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.step-forward-leave-to {
  opacity: 0;
  transform: translateX(-24px);
  filter: blur(2px);
}

.step-back-enter-from {
  opacity: 0;
  transform: translateX(-24px);
  filter: blur(2px);
}

.step-back-enter-to {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.step-back-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.step-back-leave-to {
  opacity: 0;
  transform: translateX(24px);
  filter: blur(2px);
}
</style>
