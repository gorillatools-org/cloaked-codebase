<script setup>
import { computed, reactive } from "vue";

import store from "@/store";

import OnboardingStepOne from "@/features/modals/onboarding/OnboardingStepOne";
import OnboardingStepTwo from "@/features/modals/onboarding/OnboardingStepTwo";
import OnboardingStepFour from "@/features/modals/onboarding/OnboardingStepFour";
import OnboardingStepThree from "@/features/modals/onboarding/OnboardingStepThree";

import UserService from "@/api/actions/user-service";
import AppModal from "@/features/ui/AppModal.vue";

import {
  NEEDS_ONBOARDED_V4,
  ONBOARD_SELECTED_VALUE,
} from "@/scripts/userFlags";

const emits = defineEmits(["close", "next", "back"]);

const AVAILABLE_STEPS = [
  OnboardingStepOne,
  OnboardingStepTwo,
  OnboardingStepThree,
  OnboardingStepFour,
];

const FIRST_OPTIONS = [
  "Masked information",
  "Communicate",
  "Import",
  "Store data",
];

const ui = reactive({
  step: 0,
});

const getFirst = computed(() => {
  const found = FIRST_OPTIONS.findIndex(
    (o) => o === store.getters.getFlag(ONBOARD_SELECTED_VALUE)
  );
  if (found > -1) {
    return found;
  }
  return 0;
});

const FIRST_OPTIONS_SORTED = computed(() => {
  const available = [...FIRST_OPTIONS];
  const first = available[getFirst.value];
  const remaining = available.filter((a, i) => i !== getFirst.value);

  return [first, ...remaining];
});

const steps = computed(() => {
  const available = [...AVAILABLE_STEPS];
  const first = available[getFirst.value];
  const remaining = available.filter((a, i) => i !== getFirst.value);

  return [first, ...remaining];
});

const step = computed(() => {
  return steps.value[ui.step];
});

function setStep(dir) {
  let nextStep = ui.step + dir;
  if (nextStep > steps.value.length - 1) {
    nextStep = steps.value.length - 1;
  } else if (nextStep < 0) {
    nextStep = 0;
  }
  ui.step = nextStep;
}

function close() {
  emits("close");
}

function finished() {
  UserService.setFlag({ name: NEEDS_ONBOARDED_V4, value: true });
  close();
}
</script>

<template>
  <AppModal
    v-bind="$attrs"
    @close="close"
  >
    <Component
      :is="step"
      :step="ui.step"
      :nextStep="FIRST_OPTIONS_SORTED[ui.step + 1]"
      @next="setStep(1)"
      @back="setStep(-1)"
      @close="close"
      @finished="finished"
    />
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.onboarding-modal {
  &__content {
    &.app-modal-content {
      width: 740px;
    }
  }

  &__footer {
    justify-content: space-between;
  }

  &__primary-button {
    gap: 16px;
    border: none;
    display: flex;
    cursor: pointer;
    padding: 20px 30px;
    align-items: center;
    border-radius: 100px;
    color: $color-primary-1;
    background: $color-success;
    justify-content: space-between;
    font-family: $global-font;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;

    &:hover {
      opacity: 0.9;
    }
  }

  &__secondary-button {
    gap: 16px;
    border: none;
    cursor: pointer;
    padding: 20px 30px;
    align-items: center;
    border-radius: 100px;
    color: $color-primary-1;
    background: $color-primary-100;
    font-family: $global-font;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;

    &:hover {
      opacity: 0.9;
    }
  }

  &__tertiary-button {
    border: none;
    cursor: pointer;
    background-color: transparent;
    font-family: $global-font;
    color: $color-primary-100;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-decoration: underline;
    padding: 0;

    &:hover {
      opacity: 0.8;
    }

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
