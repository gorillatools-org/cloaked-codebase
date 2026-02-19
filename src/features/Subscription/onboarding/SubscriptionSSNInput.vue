<script setup lang="ts">
import { nextTick, useTemplateRef } from "vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { useValidation } from "@/composables/validation/useValidation";

interface Props {
  required?: boolean;
  label?: string;
}

const emit = defineEmits<{
  (e: "input-focus"): void;
  (e: "input-blur"): void;
}>();

const props = withDefaults(defineProps<Props>(), {
  required: true,
  label: undefined,
});

const model = defineModel<string>({ default: "" });

const MAX_DIGITS = 9;
const ssnInputRef =
  useTemplateRef<InstanceType<typeof BaseInput>>("ssnInputRef");

const {
  error: ssnError,
  validate: validateSsn,
  validateDebounced: validateSsnDebounced,
} = useValidation(
  () => model.value,
  { debounceTimeout: 100, isRequired: props.required },
  (value, { isRequired }) => {
    const digits = onlyDigits(String(value ?? ""));

    if (!isRequired && !digits) return null;
    if (!digits || digits.length !== MAX_DIGITS)
      return "Enter a valid Social Security Number";

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

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "").slice(0, MAX_DIGITS);
}

function onSsnBlur() {
  validateSsn();
  emit("input-blur");
}

function onSsnFocus() {
  emit("input-focus");
}

function onSsnInput(e: InputEvent & { target: HTMLInputElement }) {
  const raw = e.target.value || "";
  const digits = onlyDigits(raw);
  const visible = raw.indexOf("•") === -1;

  const formatted = visible
    ? digits.length <= 3
      ? digits
      : digits.length <= 5
        ? `${digits.slice(0, 3)}-${digits.slice(3)}`
        : `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
    : "•".repeat(digits.length);

  if (formatted !== raw) {
    const cursorPosition = e.target.selectionStart || 0;
    const digitsBeforeCursor = onlyDigits(raw.slice(0, cursorPosition)).length;

    e.target.value = formatted;

    let newCursorPosition = 0;
    let digitCount = 0;

    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        digitCount++;
        if (digitCount === digitsBeforeCursor) {
          newCursorPosition = i + 1;
          break;
        }
      }
      if (digitCount < digitsBeforeCursor) {
        newCursorPosition = i + 1;
      }
    }

    nextTick(() => {
      e.target.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  }

  model.value = formatted;

  if (ssnError.value) validateSsnDebounced();
}

function getValues(): string {
  return model.value || "";
}

function setValues(value: string) {
  model.value = value || "";
}

function getErrors(): { ssn: string | null } {
  return { ssn: ssnError.value as string | null };
}

function validate(): boolean {
  validateSsn();
  return !ssnError.value;
}

function submit(shouldFocusFirstInvalidInput = true): boolean {
  const isValid = validate();
  if (isValid) return true;

  if (shouldFocusFirstInvalidInput) {
    nextTick(() => {
      focusOnInput();
    });
  }

  return false;
}

function focusFirstInvalidInput() {
  if (ssnError.value) focusOnInput();
}

defineExpose({
  getValues,
  setValues,
  submit,
  validate,
  focusFirstInvalidInput,
  focus: focusOnInput,
  getErrors,
});
</script>

<template>
  <div class="subs-ssn-input">
    <BaseInput
      ref="ssnInputRef"
      v-model="model"
      :error="ssnError"
      placeholder="••• •• ••••"
      maxlength="11"
      inputmode="numeric"
      autocomplete="off"
      secret
      :title="label"
      @input="onSsnInput"
      @blur="onSsnBlur"
      @focus="onSsnFocus"
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
          !ssnError && !!model && model.replace(/\D/g, '').length === MAX_DIGITS
        "
        #right
      >
        <BaseIcon
          name="check"
          class="subs-ssn-input__valid-icon"
        />
      </template>
    </BaseInput>
  </div>
</template>

<style lang="scss" scoped>
.subs-ssn-input {
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

  :deep(.base-input__input::placeholder) {
    font-size: 24px;

    @media screen and (min-width: $screen-md) {
      transform: translateY(2.8px);
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
