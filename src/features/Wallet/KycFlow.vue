<script setup>
import WelcomeView from "./KycFlow/WelcomeView.vue";
import { ref, watch } from "vue";
import KycFormView from "./KycFlow/KycFormView.vue";
import IdentityVerificationModal from "./KycFlow/IdentityVerificationModal.vue";
import KycLimitReached from "./KycFlow/KycLimitReached.vue";
import store from "@/store";

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
</script>

<template>
  <div>
    <WelcomeView
      v-if="!kycLimitReached"
      @toggleVisible="startKycForm"
    />
    <KycLimitReached v-if="kycLimitReached" />
    <KycFormView
      :class="{ open: kycVisible }"
      @toggleVisible="toggleVisible"
    />
    <IdentityVerificationModal
      :show="modal"
      @close="toggleModal()"
      @goBack="goBack()"
    />
  </div>
</template>
