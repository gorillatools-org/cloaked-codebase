<script setup lang="ts">
import { ref, computed } from "vue";
import { debounce } from "lodash-es";
import BaseMedallion from "@/library/BaseMedallion.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import InputValidationError from "@/features/InputValidationError.vue";
import BaseButton from "@/library/BaseButton.vue";
import { posthogCapture } from "@/scripts/posthog";

const emit = defineEmits<{
  (e: "continue", amount: number): void;
}>();

const tooltipTitle = `When you create a Virtual Card, we run a quick check on your payment method to make sure it's ready for use.

You might see a temporary “pre‑authorization” charge—this is just a hold, not a real charge, and it will disappear within 24 hours.
`;

const amount = ref("50");
const amountLimit = 100;
const isInputTouched = ref(false);

const amountError = computed(() => {
  const amountFloat = parseFloat(amount.value);
  const regex = /^\d+(\.\d{1,2})?$/;

  if (isNaN(amountFloat) || !regex.test(amount.value) || amountFloat < 0.5) {
    return "Amount must be at least $ 0.50.";
  }

  if (amountFloat > amountLimit) {
    return `Your first card's amount must be below $ ${amountLimit}.`;
  }

  return null; // No error
});

function preventAmountInputCharacters(event: KeyboardEvent) {
  const { key, target } = event;

  sendEditLimitEvent();

  const controlKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];

  if (controlKeys.includes(key)) return;

  // Prevent non-numeric and non-decimal characters
  if (!/[\d.]/.test(key)) {
    event.preventDefault();
    return;
  }

  // Prevent more than 1 decimal point
  const { value, selectionStart, selectionEnd } = target as HTMLInputElement;
  if (key === "." && value.includes(".")) {
    event.preventDefault();
    return;
  }

  // Prevent more than 2 decimal places
  const newValue =
    value.slice(0, selectionStart ?? 0) + key + value.slice(selectionEnd ?? 0);
  const decimalPart = newValue.split(".")[1];

  if (decimalPart && decimalPart.length > 2) {
    event.preventDefault();
  }
}

function handleBlur() {
  if (!amount.value) {
    amount.value = "1";
  }

  isInputTouched.value = true;
}

const sendEditLimitEvent = debounce(() => {
  posthogCapture("pay_post_kyc_onboarding_set_limit_edited");
}, 1000);

const handleContinue = () => {
  posthogCapture("pay_post_kyc_onboarding_set_limit_continue_tapped");
  emit("continue", parseFloat(amount.value));
};
</script>

<template>
  <div class="pay-onboarding-card-limit-step-4">
    <BaseMedallion
      size="lg"
      color="primary-adaptative"
      icon="money"
    />
    <BaseText
      variant="headline-2-semibold"
      class="pay-onboarding-card-limit-step-4__title"
    >
      Set default card limit
    </BaseText>
    <BaseText
      variant="headline-6-medium"
      class="pay-onboarding-card-limit-step-4__description"
    >
      We will issue a temporary
      <UiTooltip
        class="pay-onboarding-card-limit-step-4__description-tooltip"
        :max-width="300"
        is-multiline
        :title="tooltipTitle"
      >
        <span class="pay-onboarding-card-limit-step-4__description--underline">
          pre‑authorization
          <BaseIcon
            class="pay-onboarding-card-limit-step-4__description-icon"
            name="info"
          />
        </span>
      </UiTooltip>
      on your linked funding source to confirm available funds for this limit.
    </BaseText>

    <div class="pay-onboarding-card-limit-step-4__amount-container">
      <input
        v-model="amount"
        class="pay-onboarding-card-limit-step-4__amount-input"
        inputmode="numeric"
        maxlength="6"
        type="text"
        aria-label="Card spending limit amount"
        aria-describedby="amount-error"
        :aria-invalid="!!amountError && isInputTouched"
        @keydown="preventAmountInputCharacters"
        @blur="handleBlur"
      />
    </div>
    <transition name="error-fade">
      <InputValidationError
        v-if="amountError && isInputTouched"
        id="amount-error"
        class="pay-onboarding-card-limit-step-4__amount-error"
      >
        {{ amountError }}
      </InputValidationError>
    </transition>

    <footer class="pay-onboarding-card-limit-step-4__footer">
      <BaseText
        variant="caption-bold"
        class="pay-onboarding-card-limit-step-4__footer-description"
      >
        <!-- eslint-disable-next-line -->
        By default, your spending limit is set to <strong>Monthly</strong>, which you can update anytime in Card Settings.
      </BaseText>

      <BaseButton
        :disabled="!!amountError"
        variant="secondary"
        size="lg"
        @click="handleContinue"
      >
        Continue
      </BaseButton>
    </footer>
  </div>
</template>

<style scoped lang="scss">
$component-name: "pay-onboarding-card-limit-step-4";
$description-max-width: 340px;

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0 20px 20px;

  &__title {
    text-align: center;

    @media all and (width < $screen-sm) {
      font-size: 29px;
    }
  }

  &__description {
    text-align: center;
    max-width: $description-max-width;

    &-brand {
      font-weight: bold;
      text-transform: capitalize;
    }

    &--underline {
      text-decoration: underline;
    }

    &-icon {
      margin-left: 4px;
      transform: translateY(2px);
    }
  }

  &__amount-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 24px;
    position: relative;
    max-width: calc(80vw - 24px);

    &::before {
      content: "$";
      position: absolute;
      left: -30px;
      top: 5px;
      font-size: 29px;
      font-weight: 600;
      color: $color-primary-100;
    }
  }

  &__amount-input {
    background-color: $color-primary-5;
    border: 1px solid $color-primary-30;
    border-radius: 20px;
    font-size: 50px;
    font-weight: 500;
    padding-inline: 15px;
    text-align: center;
    max-width: calc(80vw - 24px);

    /* Fallback for browsers without field-sizing support */
    width: 150px;

    &:focus {
      outline: none !important;
    }

    /* Apply content-based sizing only when supported */
    @supports (field-sizing: content) {
      width: unset;
      field-sizing: content;
    }

    @media all and (min-width: $screen-md) {
      font-size: 90px;
      padding-inline: 40px;
      text-align: right;
    }
  }

  &__amount-error {
    margin-top: 10px;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 24px;
    gap: 24px;

    &-description {
      text-align: center;
      font-weight: 500;
      color: $color-primary-70;
      max-width: $description-max-width;
    }

    button {
      width: 100%;
    }
  }
}

.error-fade-enter-active {
  transition: all 0.3s ease-in-out;
}

.error-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.error-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.error-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.error-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
