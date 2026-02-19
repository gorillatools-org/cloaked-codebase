<script setup lang="ts">
import { ref, onMounted, computed, type ComputedRef } from "vue";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";
import CardsServices from "@/api/actions/cards-services";
import moment from "moment";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  useKYC,
  type KYCStatusButtonAction,
  type KYCStatusSpecs,
} from "@/composables/useKYC";
import type { EDDBehaviorEnum } from "@/types/Wallet/kyc";
import WalletStatusSection from "@/features/Wallet/WalletStatusSection.vue";
import KycManualReviewDocsList from "@/features/Wallet/KycFlow/KycManualReviewDocsList.vue";

const emit = defineEmits(["tryAgain", "backToDashboard"]);

const props = defineProps({
  form: { type: Object, default: null },
});

const { getEddDocumentsDescriptions, getKYCFailureMessage } = useKYC();
const loading = ref(true);
const eddBehavior = ref<EDDBehaviorEnum | null>(null);
const requiredDocuments = ref<string[]>([]);
const kycFailureStatus = ref<KYCStatusSpecs | null>(null);

onMounted(() => {
  submitKyc();
});

const requiredDocumentsDescriptions = computed(() => {
  if (requiredDocuments.value?.length === 0) {
    return [];
  }
  return getEddDocumentsDescriptions(requiredDocuments.value) || [];
});

const kycStatus: ComputedRef<KYCStatusSpecs> = computed(() => {
  if (kycFailureStatus.value && !loading.value) {
    return kycFailureStatus.value;
  }

  const loadingStatus: KYCStatusSpecs = {
    state: "LOADING",
    statusSectionProps: {
      title: "Hang tight—we're checking your info.",
      description: "This should only take a moment.",
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
    kycFailureStatus.value?.state?.toLowerCase() || "undefined";

  if (action === "close") {
    posthogCapture(
      `pay_wallet_kyc_flow_kyc_${pageStateName}_back_to_dashboard_button_tapped`
    );
    emit("backToDashboard");
  } else if (action === "emailSupport") {
    posthogCapture(
      `pay_wallet_kyc_flow_kyc_${pageStateName}_contact_support_button_tapped`
    );
    openSupportLink();
  } else {
    posthogCapture(
      `pay_wallet_kyc_flow_kyc_${pageStateName}_try_again_button_tapped`
    );
    emit("tryAgain");
  }
}

function openSupportLink() {
  window.open(HELP_CENTER_BASE_URL, "_blank");
}

function submitKyc() {
  const payload = {
    first_name: props.form.first_name,
    last_name: props.form.last_name,
    email: props.form.email,
    phone_number: props.form.phone_number,
    dob: moment(props.form.dob, "MM/DD/YYYY").format("YYYY-MM-DD"),
    government_id: props.form.government_id,
    address: {
      street: props.form.address.street,
      postcode: props.form.address.postcode,
      city: props.form.address.city,
      state_province: props.form.address.state_province,
      country: props.form.address.country,
    },
  };

  CardsServices.postActiveKYC(payload)
    .then(() => {
      posthogCapture("pay_wallet_kyc_flow_kyc_submitted");

      setTimeout(() => {
        document.body.classList.remove("overflow-hidden");
        if (store.state.authentication?.user) {
          store.state.authentication.user = {
            ...store.state.authentication.user,
            cloaked_card_kyc_configured: true,
          };
        }
      }, 2000);
    })
    .catch((error) => {
      const data = error?.response?.data || {};
      const edd = error.response?.data?.edd;

      kycFailureStatus.value = getKYCFailureMessage(data);

      if (kycFailureStatus.value?.state) {
        posthogCapture(
          `pay_wallet_kyc_flow_kyc_${kycFailureStatus.value?.state?.toLowerCase()}_viewed`
        );
      }

      if (edd) {
        eddBehavior.value = edd?.behavior;
        requiredDocuments.value = edd?.required_documents || [];
      }

      posthogCapture("pay_wallet_kyc_flow_kyc_submission_failed");
    })
    .finally(() => {
      // Use timeout for UX purposes
      setTimeout(() => {
        store.dispatch("authentication/getUser");
        loading.value = false;
      }, 2000);
    });
}
</script>

<template>
  <div class="kyc-step4">
    <WalletStatusSection
      v-bind="kycStatus.statusSectionProps"
      :description-max-width="550"
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
$component-name: "kyc-step4";

.#{$component-name} {
  height: 100%;
}
</style>
