<script setup lang="ts">
import { nextTick, onMounted, useTemplateRef } from "vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import { useValidation } from "@/composables/validation/useValidation";
import { useVirtualCardsApplicationStore } from "@/pinia/VirtualCards/useVirtualCardsApplicationStore";
import { posthogCapture } from "@/scripts/posthog.js";

const emit = defineEmits<{ (e: "continue"): void }>();

const MAX_DIGITS = 9;
const tooltipTitle =
  "If you do not have a SSN, you may use an ITIN (Individual Taxpayer Identification Number) to apply for Cloaked Pay.";
const virtualCardsApplication = useVirtualCardsApplicationStore();
const ssnInputRef =
  useTemplateRef<InstanceType<typeof BaseInput>>("ssnInputRef");

onMounted(() => {
  posthogCapture("dashboard_pay_kyc_ssn_form_screenview");
  focusOnInput();
});

const {
  error: ssnError,
  validate: validateSsn,
  validateDebounced: validateSsnDebounced,
} = useValidation(
  () => virtualCardsApplication.detailsFormData.ssn,
  { debounceTimeout: 100, isRequired: true },
  (value, { isRequired }) => {
    const digits = onlyDigits(String(value ?? ""));

    if (!isRequired && !digits) return null;
    if (!digits || digits.length !== MAX_DIGITS)
      return "Enter a valid Social Security number";

    return null;
  }
);

function focusOnInput() {
  (
    ssnInputRef.value?.$el?.querySelector?.("input") as
      | HTMLInputElement
      | undefined
  )?.focus();
}

const onlyDigits = (v: string) =>
  (v || "").replace(/\D/g, "").slice(0, MAX_DIGITS);

const onSsnBlur = () => validateSsn();

function onSsnInput(e: InputEvent & { target: HTMLInputElement }) {
  const raw = e.target.value || "";
  const digits = onlyDigits(raw);
  const visible = raw.indexOf("•") === -1;

  // Masking the SSN
  const formatted = visible
    ? digits.length <= 3
      ? digits
      : digits.length <= 5
        ? `${digits.slice(0, 3)} ${digits.slice(3)}`
        : `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
    : "•".repeat(digits.length);
  if (formatted !== raw) {
    e.target.value = formatted;
  }

  virtualCardsApplication.detailsFormData.ssn = formatted;

  if (ssnError.value) validateSsnDebounced();
}

function handleContinue() {
  validateSsn();
  if (!ssnError.value) {
    posthogCapture("dashboard_pay_kyc_ssn_form_continue_clicked");
    emit("continue");
    return;
  }
  nextTick(() => {
    focusOnInput();
  });
}
</script>

<template>
  <div class="vc-application-ssn-form">
    <div class="vc-application-ssn-form__wrapper">
      <header class="vc-application-ssn-form__header">
        <BaseMedallion
          size="lg"
          color="spam-protection"
          icon="shield-lock-filled"
        />
        <BaseText
          variant="headline-2-semibold"
          class="vc-application-ssn-form__title"
        >
          Social Security number
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="vc-application-ssn-form__description"
        >
          Our bank partner requires your SSN to verify your identity, as
          mandated by law. Cloaked will never store or share it.
        </BaseText>
      </header>

      <div class="vc-application-ssn-form__content">
        <div class="vc-application-ssn-form__form">
          <BaseInput
            ref="ssnInputRef"
            v-model="virtualCardsApplication.detailsFormData.ssn"
            :error="ssnError"
            placeholder="••• •• ••••"
            maxlength="11"
            inputmode="numeric"
            autocomplete="off"
            secret
            @keydown.enter="handleContinue"
            @input="onSsnInput"
            @blur="onSsnBlur"
          >
            <template #after="{ error }">
              <transition name="error-fade">
                <BaseInputFeedback
                  v-if="error"
                  :message="error as string"
                  variant="error"
                  class="base-input__feedback"
                />
              </transition>
            </template>
            <template
              v-if="
                !ssnError &&
                !!virtualCardsApplication.detailsFormData.ssn &&
                virtualCardsApplication.detailsFormData.ssn.replace(/\D/g, '')
                  .length === 9
              "
              #right
            >
              <BaseIcon
                name="check"
                class="vc-application-ssn-form__valid-icon"
              />
            </template>
          </BaseInput>
        </div>
      </div>

      <footer class="vc-application-ssn-form__footer">
        <BaseText
          variant="body-small-semibold"
          class="vc-application-ssn-form__footer-description"
        >
          Don't have an SSN?
          <UiTooltip
            :max-width="300"
            align-x="center"
            is-multiline
            :title="tooltipTitle"
          >
            <BaseIcon
              class="vc-application-ssn-form__footer-description-icon"
              name="info"
            />
          </UiTooltip>
        </BaseText>
        <BaseButton
          variant="secondary"
          class="vc-application-ssn-form__footer-cta"
          @click="handleContinue"
        >
          Save and continue
        </BaseButton>
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "vc-application-ssn-form";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  width: 100%;

  &__wrapper {
    max-width: 430px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__title {
    text-align: center;
    margin-top: 13px;
  }

  &__description {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    text-align: center;
    margin-top: 8px;
    color: $color-primary-70;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__form {
    width: 90%;
    margin-top: 24px;

    :deep(.base-input__input::placeholder) {
      font-size: 24px;
      transform: translateY(2.8px);
    }
  }

  &__valid-icon {
    width: 19px;
    height: 19px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: $color-spam-protection;
    color: $color-base-white-100;
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 24px;
    gap: 24px;

    &-description {
      display: inline-flex;
      align-items: center;
      text-align: center;
      gap: 4px;
      color: $color-primary-70;

      &-icon {
        font-size: 16px;
        font-weight: 400;
        margin-top: -4px;
      }
    }

    &-cta {
      width: 80%;
    }
  }
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.error-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  margin-top: 0;
}

.error-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}

.error-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
  margin-top: 4px;
}

.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  margin-top: 0;
}
</style>
