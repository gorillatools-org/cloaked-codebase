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
    title: "Agreements",
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
  steps.value[index].active = false;
  steps.value[index + 1].active = true;
  posthogCapture(`dashboard_pay_wallet_kyc_flow_step_${index + 2}_viewed`);
}

onMounted(() => {
  personalService.getPersonalEmails();
  personalService.getPersonalPhones();
  personalService.getInfo();
  posthogCapture("dashboard_pay_wallet_kyc_flow_step_1_viewed");
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
  posthogCapture("dashboard_pay_wallet_kyc_flow_close_button_clicked");

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
  posthogCapture(
    "dashboard_pay_wallet_kyc_flow_step_4_try_again_button_clicked"
  );
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

    <div class="content">
      <ProgressBar
        :maxSteps="steps.length - 1"
        :currentStep="activeStep.step"
        :title="activeStep.title"
      />

      <Step1
        v-if="activeStep.step === 1"
        :form="formData"
        @validateStep="validateStep()"
        @invalidateStep="invalidateStep()"
      />

      <Step2
        v-if="activeStep.step === 2"
        :form="formData"
        @validateStep="validateStep()"
        @invalidateStep="invalidateStep()"
      />

      <Step3
        v-if="activeStep.step === 3"
        @validateStep="validateStep()"
      />

      <Step4
        v-if="activeStep.step === 4"
        :form="formData"
        @validateStep="validateStep()"
        @invalidateStep="invalidateStep()"
        @tryAgain="tryAgain"
      />

      <div
        v-if="activeStep.step !== 4"
        class="button"
      >
        <button
          :disabled="!activeStep.validated"
          @click="nextStep()"
        >
          <span v-if="activeStep.step === 3">
            Agree &amp; submit application
            <inlineSvg
              :key="activeStep.step"
              name="user-verification"
            />
          </span>
          <span v-else>
            Continue
            <inlineSvg
              :key="activeStep.step"
              name="arrow-right"
            />
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
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
    max-width: 478px;
    margin: 0 auto;
    padding: 33px 0 48px;
    min-height: 100%;
    display: flex;
    flex-direction: column;

    > div {
      &:last-child {
        margin-top: auto;
      }
    }

    .button {
      button {
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

        svg {
          width: 15px;
          height: 15px;
          margin-left: 10px;
          display: inline-block;
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        span {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
}
</style>
