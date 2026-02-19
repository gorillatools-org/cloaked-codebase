<script setup>
import WelcomeView from "./KycFlow/WelcomeView.vue";
import { ref, watch } from "vue";
import KycFormView from "./KycFlow/KycFormView.vue";
import IdentityVerificationModal from "./KycFlow/IdentityVerificationModal.vue";
import store from "@/store";
import { computed } from "vue";
import WalletSupportContact from "./WalletSupportContact.vue";
import { useKYC } from "@/composables/useKYC";
import KycManualReviewDocsList from "./KycFlow/KycManualReviewDocsList.vue";
import { EDDBehaviorEnum } from "@/types/Wallet/kyc";

const { getEddDocumentsDescriptions } = useKYC();
const kycLimitReached = store.state.authentication?.user?.kyc_limit_reached;
const kycVisible = ref(false);
const modal = ref(false);

function startKycForm() {
  if (
    store.getters["settings/isSubscribed"] ||
    store.getters["settings/isLegacy"]
  ) {
    toggleVisible();
  } else if (store.getters["settings/isTrial"]) {
    store.dispatch("openModal", {
      header: "Congratulations you're an early user for Cloaked Pay!",
      subheader:
        "To enable Cloaked Pay, please upgrade with this promo code <b>FAM2024</b> for 80% off the monthly subscription.",
      button: {
        text: "Upgrade now",
        onClick: () =>
          store.dispatch("subscription/openSubscriptionModal", {
            promoCode: "FAM2024",
          }),
      },
    });
  } else if (store.getters["settings/isCancelled"]) {
    store.dispatch("openModal", {
      header: "Cloaked Pay is not available for you",
      subheader: "To enable Cloaked Pay, please upgrade your subscription.",
      button: {
        text: "Upgrade now",
        onClick: () => store.dispatch("subscription/openSubscriptionModal"),
      },
    });
  }
}

function toggleVisible() {
  kycVisible.value = !kycVisible.value;
}

function toggleModal() {
  modal.value = !modal.value;
}

function goBack() {
  toggleModal();
  toggleVisible();
}

watch(
  kycVisible,
  (value) => {
    if (value) {
      document.body.classList.add("overflow-hidden");

      setTimeout(() => {
        toggleModal();
      }, 50);
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  },
  { deep: true }
);

const user = computed(() => {
  return store.state.authentication?.user;
});

const kycManualReview = computed(() => {
  return user.value?.edd_state?.behavior === EDDBehaviorEnum.MANUAL_REVIEW;
});

const kycManualRequiredDocuments = computed(() => {
  const requiredDocuments = user.value?.edd_state?.required_documents || [];
  if (requiredDocuments?.length === 0) {
    return [];
  }

  return getEddDocumentsDescriptions(requiredDocuments) || [];
});
</script>

<template>
  <div>
    <KycManualReviewDocsList
      v-if="kycManualReview"
      :documents="kycManualRequiredDocuments"
    />
    <WalletSupportContact
      v-else-if="kycLimitReached"
      title="Cannot complete verification"
      description="The limit for KYC checks has been reached. Please contact support for assistance."
    />
    <WelcomeView
      v-else-if="!kycLimitReached"
      @toggle-visible="startKycForm"
    />
    <KycFormView
      :class="{ open: kycVisible }"
      @toggle-visible="toggleVisible"
    />
    <IdentityVerificationModal
      :show="modal"
      @close="toggleModal()"
      @go-back="goBack()"
    />
  </div>
</template>
