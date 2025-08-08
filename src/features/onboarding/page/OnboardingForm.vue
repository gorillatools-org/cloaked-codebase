<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from "vue";

import OnboardingFormVerifyEmail from "@/features/onboarding/page/OnboardingFormVerifyEmail.vue";
import OnboardingFormPhone2FA from "@/features/onboarding/page/OnboardingForm2FAPhone.vue";
import OnboardingFormFirstSteps from "@/features/onboarding/page/OnboardingFormFirstSteps.vue";
import OnboardingFormForwardingEmail from "@/features/onboarding/page/OnboardingFormForwardingEmail.vue";
import OnboardingFormForwardingPhone from "@/features/onboarding/page/OnboardingFormForwardingPhone.vue";

import {
  ONBOARDING_FORM_STEPS,
  STEP_VERIFY_EMAIL,
  STEP_PHONE_2FA,
  STEP_FIRST_STEPS,
  STEP_FORWARDING_EMAIL,
  STEP_FORWARDING_PHONE,
} from "@/features/onboarding/page/utils";
import LineProgress from "@/features/ui/LineProgress.vue";

const props = defineProps({
  step: {
    type: String,
    default: STEP_FORWARDING_EMAIL,
    validator: (value) => ONBOARDING_FORM_STEPS.includes(value),
  },
});

const emit = defineEmits(["set-step", "input"]);

const attrs = useAttrs();

const stepToFormComponent = {
  [STEP_FORWARDING_EMAIL]: OnboardingFormForwardingEmail,
  [STEP_VERIFY_EMAIL]: OnboardingFormVerifyEmail,
  [STEP_FORWARDING_PHONE]: OnboardingFormForwardingPhone,
  [STEP_PHONE_2FA]: OnboardingFormPhone2FA,
  [STEP_FIRST_STEPS]: OnboardingFormFirstSteps,
};

const progress = computed(
  () =>
    (ONBOARDING_FORM_STEPS.indexOf(props.step) + 1) /
    ONBOARDING_FORM_STEPS.length
);

const onBack = () => {
  const moveTwoSteps =
    (props.step === STEP_FIRST_STEPS &&
      attrs.value.forwardEmail === "Not now") ||
    (props.step === STEP_FORWARDING_EMAIL && !attrs.value.isPhoneVerified);

  emit(
    "set-step",
    ONBOARDING_FORM_STEPS[
      Math.max(
        ONBOARDING_FORM_STEPS.indexOf(props.step) - (moveTwoSteps ? 2 : 1),
        0
      )
    ]
  );
};

const onNext = () => {
  const moveTwoSteps =
    (props.step === STEP_FORWARDING_EMAIL &&
      attrs.value.forwardEmail === "Not now") ||
    (props.step === STEP_PHONE_2FA && !attrs.value.isPhoneVerified);

  emit(
    "set-step",
    ONBOARDING_FORM_STEPS[
      Math.min(
        ONBOARDING_FORM_STEPS.indexOf(props.step) + (moveTwoSteps ? 2 : 1),
        ONBOARDING_FORM_STEPS.length - 1
      )
    ]
  );
};

const stepToTitle = {
  [STEP_FORWARDING_EMAIL]: "Email forwarding",
  [STEP_VERIFY_EMAIL]: "Email verification",
  [STEP_PHONE_2FA]: "Two-factor authentication",
  [STEP_FORWARDING_PHONE]: "Text and call forwarding",
  [STEP_FIRST_STEPS]: "How can we help?",
};

const header = ref(null);
const headerWidth = ref(0);

const onWindowResize = () => {
  headerWidth.value = header.value?.offsetWidth ?? 0;
};

onMounted(() => {
  window.addEventListener("resize", onWindowResize, { passive: true });
  onWindowResize();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onWindowResize);
});

const progressWidth = computed(() =>
  Math.max(0, Math.min(headerWidth.value - 220, 245))
);
</script>

<template>
  <form class="onboarding-form">
    <header
      ref="header"
      class="onboarding-form__header"
    >
      <h2 class="onboarding-form__subtitle">
        {{ stepToTitle[step] }}
      </h2>
      <LineProgress
        :width="progressWidth"
        :progress="progress"
      />
    </header>
    <Component
      :is="stepToFormComponent[step]"
      v-bind="$attrs"
      :value="$attrs.value"
      @input="emit('input', $event)"
      @back="onBack"
      @next="onNext"
    />
  </form>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
@import "@/assets/scss/animations";

// breakpoints from cloaked-auth
$screen-md: 700px;

.onboarding-form {
  border: 1px solid $color-primary-20;
  background: $color-base-white-100;
  max-height: 950px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 25px;
  border-radius: 24px;

  @media (min-width: $screen-md) {
    padding: 40px 60px;
    border-radius: 32px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__content {
    flex-grow: 1;
    margin-top: 24px;
    display: flex;
    flex-direction: column;

    @media (min-width: $screen-md) {
      margin-top: 40px;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-top: auto;

    & > *:first-child {
      margin-right: auto;
    }
  }

  &__title {
    font-family: $global-font;
    color: $color-primary-100;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: 1.125;
    margin-top: auto;

    @media (min-width: $screen-md) {
      font-size: 48px;
    }
  }

  &__subtitle {
    font-family: $global-font;
    color: $color-primary-100;
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    flex-shrink: 0;
    width: 200px;
  }

  &__text {
    font-family: $global-font;
    color: $color-primary-100;
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    margin-top: 8px;

    @media (min-width: $screen-md) {
      margin-top: 16px;
    }
  }

  &__fieldset {
    padding: 0;
    border: none;
    margin: 16px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    @media (min-width: $screen-md) {
      margin: 32px 0;
    }
  }

  &__field-button {
    position: absolute;
    cursor: pointer;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 100%;
    padding: 0 20px;
    background-color: transparent;
    border: none;
    font-family: $global-font;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    display: flex;
    align-items: center;
    gap: 10px;
    color: $color-primary-100;

    &:hover {
      opacity: 0.8;
    }

    &:active {
      transform: translateY(-51%) scale(0.98);
    }

    &:disabled {
      opacity: 1;
      color: $color-primary-30;
      cursor: not-allowed;
      transform: translateY(-50%);
    }

    @at-root .app-form-input:has(&) {
      .app-form-input__input {
        padding-right: 143px;
      }
    }

    &--resend {
      @at-root .app-form-input:has(&) {
        .app-form-input__input {
          padding-right: 160px;
        }
      }
    }

    &--sending {
      @at-root .app-form-input:has(&) {
        .app-form-input__input {
          padding-right: 176px;
        }
      }
    }
  }

  &__field-code {
    opacity: 1;
    transition: opacity 100ms ease-out;

    &--invisible {
      opacity: 0;
    }
  }

  &__phone-country-code {
    display: flex;
    align-items: center;
    gap: 8px;
    font: $global-font;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;

    @at-root .app-form-input:has(&) {
      .app-form-input__input {
        padding-left: 76px;
      }
    }
  }

  &__secondary {
    font-family: $global-font;
    color: $color-primary-100;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    padding: 20px 0;
    cursor: pointer;
    border: none;
    background: none;
    line-height: 1;

    &:hover {
      opacity: 0.8;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__primary {
    padding: 20px 26px;
    border-radius: 100px;
    background: $color-success;
    color: $color-primary-1;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 16px;
    line-height: 1;

    &:hover {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__success {
    font-family: $global-font;
    color: $color-success;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 16px 0;

    @media (min-width: $screen-md) {
      margin: 32px 0;
    }

    &-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
  }
}
</style>
