<script setup>
import { reactive, computed, ref } from "vue";
import PreferencesHeader from "@/routes/modals/preferences/PreferencesHeader.vue";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle.vue";
import AccountBiometricsModal from "@/routes/modals/preferences/AccountBiometricsModal.vue";
import PreferencesCheckParagraph from "@/routes/modals/preferences/PreferencesCheckParagraph.vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import {
  WEBSITE_PRIVACY_POLICY_URL,
  WEBSITE_TERMS_OF_SERVICE_URL,
} from "@/scripts/constants";
import PreferencesParagraph from "@/routes/modals/preferences/PreferencesParagraph.vue";
import UserService from "@/api/actions/user-service";
import { useToast } from "@/composables/useToast";

const emit = defineEmits(["toggleBack", "refreshUser"]);
const showModal = ref(false);
const toast = useToast();
const state = reactive({
  step: 0,
  steps: ["password", "confirmation", "before-export", "export"],
  understandsDataWillBeDeleted: false,
  understandsAccessToServicesWillBeLost: false,
  understandsDataCannotBeRetrieved: false,
  loadingDelete: false,
  password: "",
  invalidPassword: false,
  loadingPassword: false,
  deletionDate: null,
  sendingOTPCode: false,
  otpCodeSent: false,
  otpResponseData: null,
});

const toggleBack = () => {
  emit("toggleBack", {});
};

const handleGoBack = () => {
  if (state.steps[state.step] === "before-export") {
    toggleBack();
  } else if (state.step > 0) {
    state.step = state.step - 1;
  } else {
    toggleBack();
  }
};

const hasBiometric = computed(() => {
  return store.state.authentication?.user?.has_setup_biometric;
});

const agreeToPrivacyPolicy = ref(false);
const buttonLoading = ref(false);

async function deleteBiometric() {
  buttonLoading.value = true;
  try {
    await UserService.deleteBiometric();
  } catch {
    toast.error("Error deleting your data. Please try again.");
  } finally {
    store.dispatch("authentication/getUser");
    buttonLoading.value = false;
    toast.success("Face Recovery successfully turned off.");
  }
}
</script>
<template>
  <PreferencesPanel class="">
    <template #header>
      <PreferencesHeader @go-back="handleGoBack" />
    </template>

    <PreferencesTitle>Face Recovery</PreferencesTitle>
    <PreferencesParagraph>
      Use your face to recover your account if you forget your password. Your
      face data (biometrics) is kept safe and private.
    </PreferencesParagraph>
    <PreferencesCheckParagraph
      v-if="!hasBiometric"
      :value="agreeToPrivacyPolicy"
      @input="(event) => (agreeToPrivacyPolicy = event)"
    >
      <span class="dismiss-warn">
        By using Cloaked Biometric ID, I agree to Cloaked's
        <a
          :href="WEBSITE_PRIVACY_POLICY_URL"
          target="_blank"
          class="privacy-policy-link"
        >
          {{ "Privacy Policy" }}
        </a>
        {{ " and " }}
        <a
          :href="WEBSITE_TERMS_OF_SERVICE_URL"
          target="_blank"
          class="privacy-policy-link"
        >
          Terms of Service
        </a>
        .
      </span>
    </PreferencesCheckParagraph>

    <Button
      v-if="hasBiometric"
      type="danger"
      class="setup-button"
      :loading="buttonLoading"
      :disabled="buttonLoading"
      @click="deleteBiometric"
    >
      Turn off Face Recovery
    </Button>
    <Button
      v-else
      type="primary"
      class="setup-button"
      :disabled="!agreeToPrivacyPolicy"
      @click="showModal = true"
    >
      Turn on Face Recovery
    </Button>

    <AccountBiometricsModal
      v-if="showModal"
      @close="showModal = false"
    />
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
.setup-button {
  margin-top: 16px;
}

.privacy-policy-link {
  color: $color-primary-100;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
    transition: all 0.3s ease;
  }
}
</style>
