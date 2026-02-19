<script setup lang="ts">
import { watch, ref, computed, onUnmounted } from "vue";
import VCLeadInModal from "../modals/VCLeadInModal.vue";
import VCLeadInPostKYCModal from "../modals/VCLeadInPostKYCModal.vue";
import { useCloakedPaySubscription } from "../composables/useCloakedPaySubscription";
import { useSessionStorage, toValue } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";
import { useCloakedPayUser } from "../composables/useCloakedPayUser.ts";
import { posthogCapture } from "@/scripts/posthog.js";
import { useOnboardingFlag } from "@/composables/useOnboardingFlag.js";
import UserService from "@/api/actions/user-service.js";
import {
  PERMANENTLY_DISMISSED_VIRTUAL_CARD_LEAD_IN_MODAL,
  PERMANENTLY_DISMISSED_VIRTUAL_CARD_LEAD_IN_POST_KYC_MODAL,
} from "@/scripts/userFlags.ts";

type VirtualCardsLeadInSessionState = {
  "lead-in": {
    dismissed: boolean;
  };
  "post-kyc": {
    dismissed: boolean;
  };
};

export type VirtualCardsLeadInModalType = "lead-in" | "post-kyc";

const LEAD_IN_SESSION_STATE_KEY = "virtual-cards-lead-in-session";

const [leadInModalDismissed] = useOnboardingFlag(
  PERMANENTLY_DISMISSED_VIRTUAL_CARD_LEAD_IN_MODAL
);
const [postKycModalDismissed] = useOnboardingFlag(
  PERMANENTLY_DISMISSED_VIRTUAL_CARD_LEAD_IN_POST_KYC_MODAL
);

const isLeadInModalPermanentlyDismissed = computed(
  () => toValue(leadInModalDismissed) === true
);
const isLeadInPostKycModalPermanentlyDismissed = computed(
  () => toValue(postKycModalDismissed) === true
);

const { isExistingUserSubscriptionEnabled } = useCloakedPaySubscription();
const { isEnabled, isKycValidated, isOnboardingCompleted, eddState } =
  useCloakedPayUser();

const currentModal = ref<"lead-in" | "post-kyc" | null>(null);
const isModalOpen = ref(false);
const modalTimeoutId = ref<ReturnType<typeof setTimeout> | undefined>(
  undefined
);
const router = useRouter();
const route = useRoute();

const leadInSessionState = useSessionStorage<VirtualCardsLeadInSessionState>(
  LEAD_IN_SESSION_STATE_KEY,
  {
    "lead-in": {
      dismissed: false,
    },
    "post-kyc": {
      dismissed: false,
    },
  }
);

onUnmounted(() => {
  clearTimeout(modalTimeoutId.value);
});

const checkLeadInConditionsAndShowModal = () => {
  // Don't show modal if user is not eligible for subscription or if user is in EDD state (rejected, manual review, etc.)
  if (!isExistingUserSubscriptionEnabled.value || !!eddState.value) {
    return;
  }

  if (isEnabled.value && isKycValidated.value) {
    if (!isOnboardingCompleted.value) {
      currentModal.value = "post-kyc";
      showModal();
    }
    return;
  }

  if (!isEnabled.value && !isKycValidated.value) {
    currentModal.value = "lead-in";

    showModal();
  }
};

const showModal = () => {
  if (!currentModal.value || isModalOpen.value) return;

  // Don't show modal if it has been permanently dismissed or dismissed in session
  const isPermanentlyDismissed =
    currentModal.value === "lead-in"
      ? isLeadInModalPermanentlyDismissed.value
      : isLeadInPostKycModalPermanentlyDismissed.value;

  if (
    isPermanentlyDismissed ||
    leadInSessionState.value[currentModal.value].dismissed
  ) {
    return;
  }

  modalTimeoutId.value = setTimeout(() => {
    isModalOpen.value = true;

    const eventName =
      currentModal.value === "lead-in"
        ? "pay_wallet_lead_in_intro_modal_viewed"
        : "pay_wallet_lead_in_post_kyc_modal_viewed";

    posthogCapture(eventName);
  }, 1500);
};

const handleDontShowAgain = async (modalType: VirtualCardsLeadInModalType) => {
  const eventName =
    modalType === "lead-in"
      ? "pay_wallet_lead_in_intro_modal_dont_show_again_tapped"
      : "pay_wallet_lead_in_post_kyc_modal_dont_show_again_tapped";

  posthogCapture(eventName);
  leadInSessionState.value[modalType].dismissed = true;

  const flagName =
    modalType === "lead-in"
      ? PERMANENTLY_DISMISSED_VIRTUAL_CARD_LEAD_IN_MODAL
      : PERMANENTLY_DISMISSED_VIRTUAL_CARD_LEAD_IN_POST_KYC_MODAL;

  try {
    await UserService.setFlag({ name: flagName, value: true });
  } catch (error) {
    console.error("Failed to save dismissal flag:", error);
  }
};

const handleGetVerified = (modalType: VirtualCardsLeadInModalType) => {
  posthogCapture("pay_wallet_lead_in_intro_modal_get_verified_tapped");

  leadInSessionState.value[modalType].dismissed = true;
  router.push("/virtual-cards?introStep=1");
};

const handleCloseButtonClick = (modalType: VirtualCardsLeadInModalType) => {
  const eventName =
    modalType === "lead-in"
      ? "pay_wallet_lead_in_intro_modal_close_button_tapped"
      : "pay_wallet_lead_in_post_kyc_modal_close_button_tapped";

  posthogCapture(eventName);
  leadInSessionState.value[modalType].dismissed = true;
};

const handleClose = (modalType: VirtualCardsLeadInModalType) => {
  const eventName =
    modalType === "lead-in"
      ? "pay_wallet_lead_in_intro_modal_closed"
      : "pay_wallet_lead_in_post_kyc_modal_closed";

  posthogCapture(eventName);
  leadInSessionState.value[modalType].dismissed = true;
};

const handleFinishSetup = (modalType: VirtualCardsLeadInModalType) => {
  posthogCapture("pay_wallet_lead_in_post_kyc_modal_finish_setup_tapped");
  leadInSessionState.value[modalType].dismissed = true;
  router.push("/virtual-cards");
};

watch(
  () => route.path,
  () => {
    clearTimeout(modalTimeoutId.value);

    const isInvitationPage = route.path.includes("/invitation");
    const isSubscriptionPage = route.path.includes("/settings/subscription");
    const isExposuresEnroll = route.path.includes("/exposures-enroll");
    const isVirtualCardsPage = route.path.includes("/virtual-cards");

    // Don't show modal if user is on specific pages
    if (
      isInvitationPage ||
      isSubscriptionPage ||
      isExposuresEnroll ||
      isVirtualCardsPage
    ) {
      isModalOpen.value = false;
      return;
    }

    checkLeadInConditionsAndShowModal();
  },
  { immediate: true }
);
</script>

<template>
  <div
    v-if="currentModal"
    class="vc-lead-in-section"
  >
    <VCLeadInModal
      v-if="currentModal === 'lead-in'"
      v-model="isModalOpen"
      @dont-show-again="handleDontShowAgain('lead-in')"
      @get-verified="handleGetVerified('lead-in')"
      @close-button-click="handleCloseButtonClick('lead-in')"
      @close="handleClose('lead-in')"
    />
    <VCLeadInPostKYCModal
      v-if="currentModal === 'post-kyc'"
      v-model="isModalOpen"
      @dont-show-again="handleDontShowAgain('post-kyc')"
      @finish-setup="handleFinishSetup('post-kyc')"
      @close-button-click="handleCloseButtonClick('post-kyc')"
      @close="handleClose('post-kyc')"
    />
  </div>
</template>
