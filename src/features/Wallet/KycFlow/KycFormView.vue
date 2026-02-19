<script setup>
import { ref, watch, reactive, onMounted, computed } from "vue";
import moment from "moment";
import inlineSvg from "@/features/InlineSvg.vue";
import personalService from "@/api/settings/personal-services";
import store from "@/store";
import ProgressBar from "@/features/Wallet/KycFlow/KycFormProgressBar";
import Step1 from "@/features/Wallet/KycFlow/Step1";
import Step2 from "@/features/Wallet/KycFlow/Step2";
import Step3 from "@/features/Wallet/KycFlow/Step3";
import Step4 from "@/features/Wallet/KycFlow/Step4";
import { StateList } from "@/scripts/countries/states";
import { posthogCapture } from "@/scripts/posthog.js";
import { useBasicMode } from "@/composables/useBasicMode";
import { useRouter } from "vue-router";
import BaseButton from "@/library/BaseButton.vue";

// Refs for step components
const step1Ref = ref(null);
const step2Ref = ref(null);

const { isBasicModeEnabled } = useBasicMode();

const router = useRouter();

const emit = defineEmits(["toggleVisible"]);

const steps = ref([
  {
    title: "Basic information",
    step: 1,
    active: true,
    validated: false,
  },
  {
    title: "Address",
    step: 2,
    active: false,
    validated: false,
  },
  {
    title: "Submit Verification",
    step: 3,
    active: false,
    validated: false,
  },
  {
    title: "Identity verification",
    step: 4,
    active: false,
  },
]);

const activeStep = computed(() => {
  return steps.value.find((step) => step.active);
});

function validateStep() {
  const index = steps.value.findIndex((item) => item.active);
  steps.value[index].validated = true;
}

function invalidateStep() {
  const index = steps.value.findIndex((item) => item.active);
  steps.value[index].validated = false;
}

function nextStep() {
  const index = steps.value.findIndex((item) => item.active);
  const stepRefs = [step1Ref, step2Ref];

  // Validate current step if it has validation capability
  if (stepRefs[index]?.value?.validateAllFields) {
    stepRefs[index].value.validateAllFields();

    // Check if validation passed
    if (!steps.value[index].validated) {
      return; // Don't proceed if validation failed
    }
  }

  steps.value[index].active = false;
  steps.value[index + 1].active = true;
  posthogCapture(`pay_wallet_kyc_flow_step_${index + 2}_viewed`);
}

onMounted(() => {
  personalService.getPersonalEmails();
  personalService.getPersonalPhones();
  personalService.getInfo();
  posthogCapture("pay_wallet_kyc_flow_step_1_viewed");
});

const personalEmail = computed(() => {
  const emails = store.state.settings.personalEmails;
  const primaryEmail = emails.find((email) => email.primary);
  return primaryEmail;
});

const personalPhone = computed(() => {
  const phones = store.state.settings.personalPhones;
  const primaryPhone = phones.find((phone) => phone.primary);
  return primaryPhone;
});

const info = computed(() => {
  return store.state.autofill || {};
});

const formData = reactive({
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  dob: "",
  government_id: "",
  address: {
    street: "",
    postcode: "",
    city: "",
    state_province: "",
    country: "USA",
  },
});

watch(
  personalEmail,
  (value) => {
    formData.email = value.email;
  },
  { deep: true }
);

watch(
  personalPhone,
  (value) => {
    formData.phone_number = value.phone_number;
  },
  { deep: true }
);

watch(
  info,
  (value) => {
    formData.first_name = value.first_name;
    formData.last_name = value.last_name;
    formData.dob = moment(value.dob).format("MM/DD/YYYY");
    formData.address.street = value.street_address;
    formData.address.postcode = value.postal_code;
    formData.address.city = value.address_level2;

    if (value.address_level1) {
      const stateObj = StateList.find(
        (state) => state.label === value.address_level1
      );
      if (stateObj) {
        formData.address.state_province = stateObj.value;
      }
    }
  },
  { deep: true }
);

watch(
  activeStep,
  (value) => {
    if (value.step.validated) {
      emit("toggleVisible");
    }

    if (value.step === 3) {
      setTimeout(() => {
        steps.value[2].validated = true;
      }, 600);
    }
  },
  { deep: true }
);

watch(
  formData,
  (value) => {
    if (
      value.address.street.length > 0 &&
      value.address.postcode.length > 0 &&
      value.address.city.length > 0 &&
      value.address.state_province.length > 0
    ) {
      steps.value[1].validated = true;
    } else {
      steps.value[1].validated = false;
    }
  },
  { deep: true }
);

function close() {
  emit("toggleVisible");
  posthogCapture("pay_wallet_kyc_flow_close_button_tapped");

  setTimeout(() => {
    steps.value.forEach((step) => {
      step.active = false;
    });

    steps.value[0].active = true;
    steps.value[2].validated = true;
  }, 300);
}

function tryAgain() {
  steps.value[3].active = false;
  steps.value[0].active = true;
  steps.value[2].validated = true;
  posthogCapture("pay_wallet_kyc_flow_step_4_try_again_button_tapped");
}

function backToDashboard() {
  // Push the route in the background while keeping KYC flow visible
  const routePromise = isBasicModeEnabled.value
    ? router.push({ name: "ExposureStatusBrokers" })
    : router.push({ name: "Home" });

  // Wait for navigation to complete, then smoothly close KYC flow
  routePromise
    .then(() => {
      setTimeout(() => {
        emit("toggleVisible");
      }, 100); // Small delay for smooth transition
    })
    .catch(() => {
      // Fallback: close modal even if navigation fails
      setTimeout(() => {
        emit("toggleVisible");
      }, 300);
    });
}
</script>

<template>
  <section>
    <div
      v-if="activeStep.step !== 4"
      class="close"
      @click="close()"
    >
      <inlineSvg name="chevron-left" />
    </div>

    <div
      class="content"
      :class="{ 'content--full-width': activeStep.step === 4 }"
    >
      <div class="content-step">
        <ProgressBar
          :max-steps="steps.length - 1"
          :current-step="activeStep.step"
          :title="activeStep.title"
        />

        <Step1
          v-if="activeStep.step === 1"
          ref="step1Ref"
          :form="formData"
          @validate-step="validateStep()"
          @invalidate-step="invalidateStep()"
        />

        <Step2
          v-if="activeStep.step === 2"
          ref="step2Ref"
          :form="formData"
          @validate-step="validateStep()"
          @invalidate-step="invalidateStep()"
        />

        <Step3
          v-if="activeStep.step === 3"
          @validate-step="validateStep()"
        />

        <Step4
          v-if="activeStep.step === 4"
          :form="formData"
          @validate-step="validateStep()"
          @invalidate-step="invalidateStep()"
          @try-again="tryAgain"
          @back-to-dashboard="backToDashboard"
        />
      </div>

      <footer
        v-if="activeStep.step !== 4"
        class="footer"
      >
        <BaseButton
          v-if="activeStep.step === 3"
          class="submit-verification-btn"
          icon="send"
          size="md"
          variant="primary"
          :disabled="!activeStep.validated"
          @click="nextStep()"
        >
          Submit Verification
        </BaseButton>

        <button
          v-else
          class="continue-btn"
          :disabled="!activeStep.validated"
          @click="nextStep()"
        >
          Continue
          <inlineSvg
            :key="activeStep.step"
            name="arrow-right"
          />
        </button>
      </footer>
    </div>
  </section>
</template>

<style scoped lang="scss">
/* stylelint-disable */
section {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: $color-base-white-100;

  @include transition(all 0.3s ease-in-out);

  z-index: 1000;
  overflow: auto;
  opacity: 0;
  visibility: hidden;

  &.open {
    opacity: 1;
    visibility: visible;
  }

  .close {
    position: absolute;
    top: 30px;
    left: 24px;
    background: $color-base-white-100;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-100;

    svg {
      position: relative;
      z-index: 2;
      padding: 6px;
      width: 100%;
      height: 100%;
    }

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;

      @include transform(translate(-50%, -50%));
      @include transition(all 0.3s ease-in-out);

      border-radius: 50%;
      background: $color-primary-10;
      z-index: 1;
    }

    &:hover {
      &::after {
        width: 100%;
        height: 100%;
      }
    }
  }

  .content {
    max-width: 578px;
    margin: 0 auto;
    padding: 33px 0;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;

    &--full-width {
      max-width: 100%;
      width: 100%;
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 24px;

      .continue-btn {
        width: 100%;
        padding: 11px;
        border-radius: 30px;
        background: transparent;
        color: $color-primary-100;
        font-size: 15px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        border: 1px solid $color-primary-100;
        cursor: pointer;

        &:hover {
          background: $color-primary-10;
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        svg {
          width: 15px;
          height: 15px;
          margin-left: 10px;
          display: inline-block;
        }

        span {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .submit-verification-btn {
        width: 100%;
      }
    }
  }

  .content-step {
    flex-grow: 1;
    min-height: 0;
    padding-bottom: 17px;
  }
}
</style>
