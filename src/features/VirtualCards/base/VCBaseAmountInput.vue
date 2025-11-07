<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
} from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { BaseIconName } from "@/library/baseIconTypes.ts";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import BaseText from "@/library/BaseText.vue";
import type { StyleValue } from "vue";
import { useValidation } from "@/composables/validation/useValidation";
import { formatCurrency } from "@/features/VirtualCards/utils/currency-utils.ts";

type AmountValidationOptions = { min?: number; max?: number };

defineOptions({
  inheritAttrs: false,
});

type Props = {
  placeholder?: string;
  beforeIcon?: BaseIconName | null;
  borderRadius?: number;
  inputError?: boolean;
  errorMessage?: string;
  supportText?: string;
  containerStyle?: StyleValue;
  containerClass?: string;
  backgroundColor?: "primary-5" | "white-100";
  type?: "currency" | "integer";
  min?: number;
  max?: number;
  minErrorMessage?: string;
  maxErrorMessage?: string;
  state?: "default" | "yield";
};

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Amount",
  beforeIcon: null,
  borderRadius: 16,
  inputError: false,
  errorMessage: undefined,
  supportText: undefined,
  containerStyle: undefined,
  containerClass: undefined,
  backgroundColor: "primary-5",
  type: "currency",
  min: undefined,
  minErrorMessage: undefined,
  max: undefined,
  maxErrorMessage: undefined,
  state: "default",
});

const BASE_HORIZONTAL_PADDING = 16;
const SLOT_GAP = 12;

let beforeObserver: ResizeObserver | null = null;
let afterObserver: ResizeObserver | null = null;

const model = defineModel<number>();
const attrs = useAttrs();

const inputRef = ref<HTMLInputElement | null>(null);
const beforeSlotRef = ref<HTMLElement | null>(null);
const afterSlotRef = ref<HTMLElement | null>(null);

const hasTrailingDecimal = ref(false);

const leftSlotWidthPx = ref(0);
const rightSlotWidthPx = ref(0);

const inputPaddingLeftPx = computed(
  () =>
    BASE_HORIZONTAL_PADDING +
    (leftSlotWidthPx.value > 0 ? leftSlotWidthPx.value + SLOT_GAP : 0)
);
const inputPaddingRightPx = computed(
  () =>
    BASE_HORIZONTAL_PADDING +
    (rightSlotWidthPx.value > 0 ? rightSlotWidthPx.value + SLOT_GAP : 0)
);

const formattedValue = computed<string>({
  get() {
    if (props.type === "currency") {
      if (model.value === 0 && hasTrailingDecimal.value) {
        return "$0.";
      }

      if (!model.value) {
        return "";
      }

      return `$${model.value}`;
    }

    if (!model.value) {
      return "";
    }

    return `${model.value}`;
  },
  set(raw: string) {
    model.value = sanitizeAmount(raw);
    validateDebounced();
  },
});

const resolvedErrorMessage = computed<string | undefined>(
  () => props.errorMessage ?? localError.value ?? undefined
);
const hasError = computed<boolean>(
  () => props.inputError || !!resolvedErrorMessage.value
);

onMounted(async () => {
  if (beforeSlotRef.value) {
    beforeObserver = new ResizeObserver(() => updateSlotWidths());
    beforeObserver.observe(beforeSlotRef.value);
  }
  if (afterSlotRef.value) {
    afterObserver = new ResizeObserver(() => updateSlotWidths());
    afterObserver.observe(afterSlotRef.value);
  }
  await nextTick();
  updateSlotWidths();
});

onBeforeUnmount(() => {
  beforeObserver?.disconnect();
  afterObserver?.disconnect();
});

const {
  error: localError,
  validate,
  validateDebounced,
} = useValidation<number, AmountValidationOptions>(
  () => model.value ?? 0,
  {
    // Amount input is not required by default; treat 0 as empty
    isRequired: false,
    debounceTimeout: 300,
    min: props.min,
    max: props.max,
  },
  (value, { isRequired, min, max }) => {
    const isEmpty = value === null || value === undefined;
    if (isEmpty && !isRequired) return null;

    if (min != null && value < min) {
      return props.type === "currency"
        ? (props.minErrorMessage ??
            `Amount must be at least ${formatCurrency(min, false)}`)
        : (props.minErrorMessage ?? `Value must be at least ${min}`);
    }

    if (max != null && value > max) {
      return props.type === "currency"
        ? (props.maxErrorMessage ??
            `Amount must be at most ${formatCurrency(max, false)}`)
        : (props.maxErrorMessage ?? `Value must be at most ${max}`);
    }

    return null;
  }
);

function updateSlotWidths() {
  leftSlotWidthPx.value = beforeSlotRef.value
    ? Math.ceil(beforeSlotRef.value.getBoundingClientRect().width)
    : 0;
  rightSlotWidthPx.value = afterSlotRef.value
    ? Math.ceil(afterSlotRef.value.getBoundingClientRect().width)
    : 0;
}

function sanitizeAmount(raw: string): number {
  // For integer type, only allow digits
  const regex = props.type === "integer" ? /[^\d]/g : /[^\d.]/g;
  let cleaned = raw.replace(regex, "");
  // Track trailing decimal for currency to preserve visual "$0." state
  if (props.type === "integer") {
    hasTrailingDecimal.value = false;
  } else {
    // If user starts with '.', treat as '0.' for detection as well
    const preview = cleaned.startsWith(".") ? `0${cleaned}` : cleaned;
    hasTrailingDecimal.value = preview.endsWith(".");
  }
  if (!cleaned) return 0;

  // For integer type, don't allow decimal points
  if (props.type === "integer") {
    const num = Number(cleaned);
    return Number.isNaN(num) ? 0 : num;
  }

  // Currency type logic
  // If user starts with '.', treat as '0.'
  if (cleaned.startsWith(".")) {
    cleaned = `0${cleaned}`;
  }

  const parts = cleaned.split(".");
  const integerPartRaw = parts[0] ?? "";
  const decimalJoined = parts.slice(1).join("");
  const decimalPart = decimalJoined ? decimalJoined.slice(0, 2) : "";

  // Remove leading zeros when followed by more digits (keep single zero only for decimals)
  let normalizedInteger = integerPartRaw.replace(/^0+(?=\d)/, "");
  if (normalizedInteger === "" && decimalPart) {
    normalizedInteger = "0";
  }

  // Empty or pure zero without decimals is treated as 0 (represents empty visually)
  if ((normalizedInteger === "0" || normalizedInteger === "") && !decimalPart) {
    return 0;
  }

  const normalized = normalizedInteger + (decimalPart ? `.${decimalPart}` : "");
  const num = Number(normalized);
  return Number.isNaN(num) ? 0 : num;
}

function preventIntegerInputCharacters(event: KeyboardEvent) {
  const { key } = event;
  const input = event.target as HTMLInputElement | null;
  if (!input) return;

  const controlKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];
  if (controlKeys.includes(key)) return;

  const { value, selectionStart, selectionEnd } = input;
  const start = selectionStart ?? value.length;
  const end = selectionEnd ?? value.length;

  // Only allow digits
  if (!/\d/.test(key)) {
    event.preventDefault();
    return;
  }

  // Disallow '0' as the first numeric character for integers
  if (key === "0") {
    const nextRaw = value.slice(0, start) + key + value.slice(end);
    const nextSanitized = nextRaw.replace(/[^\d]/g, "");

    if (start === 0 && nextSanitized === "0") {
      event.preventDefault();
      return;
    }
  }
}

function preventCurrencyInputCharacters(event: KeyboardEvent) {
  const { key } = event;
  const input = event.target as HTMLInputElement | null;
  if (!input) return;

  const controlKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];
  if (controlKeys.includes(key)) return;

  const { value, selectionStart, selectionEnd } = input;
  const start = selectionStart ?? value.length;
  const end = selectionEnd ?? value.length;

  // Prevent non-numeric and non-decimal characters
  if (!/[\d.]/.test(key)) {
    event.preventDefault();
    return;
  }

  // Allow a single leading 0 (e.g., "0" or "0.") but prevent multiple leading zeros in the integer part
  if (key === "0") {
    const nextRaw = value.slice(0, start) + key + value.slice(end);
    const nextSanitized = nextRaw.replace(/[^\d.]/g, "");
    const [nextInteger] = nextSanitized.split(".");
    const hasDot = nextSanitized.includes(".");

    // Block cases where integer part would become 00, 000, etc., without a decimal point
    if (nextInteger && /^0\d/.test(nextInteger) && !hasDot) {
      event.preventDefault();
      return;
    }
  }

  // Prevent more than 1 decimal point
  if (key === "." && value.includes(".")) {
    event.preventDefault();
    return;
  }

  // Prevent more than 2 decimal places
  const newValue = value.slice(0, start) + key + value.slice(end);
  const decimalPart = newValue.split(".")[1];

  if (decimalPart && decimalPart.length > 2) {
    event.preventDefault();
  }
}

function preventAmountInputCharacters(event: KeyboardEvent) {
  if (props.type === "integer") {
    preventIntegerInputCharacters(event);
  } else {
    preventCurrencyInputCharacters(event);
  }
}

function ensureCursorAfterDollar() {
  if (props.type !== "currency" || !inputRef.value) return;

  const input = inputRef.value;
  const value = input.value;
  if (!value || !value.startsWith("$")) return;

  const selectionStart = input.selectionStart ?? 0;
  const selectionEnd = input.selectionEnd ?? 0;
  const valueLength = value.length;

  if (selectionStart === 0) {
    nextTick(() => {
      if (inputRef.value) {
        // If full selection, preserve it but start at position 1
        if (selectionEnd === valueLength) {
          inputRef.value.setSelectionRange(1, valueLength);
        } else {
          inputRef.value.setSelectionRange(1, 1);
        }
      }
    });
  }
}

watch(
  () => model.value,
  () => {
    validateDebounced();
  }
);

watch([() => props.min, () => props.max], () => {
  validateDebounced();
});

watch([() => props.beforeIcon], async () => {
  await nextTick();
  updateSlotWidths();
});

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  hasError,
  input: inputRef,
});
</script>

<template>
  <div
    class="vc-base-amount-input"
    :style="containerStyle"
    :class="containerClass"
  >
    <div class="vc-base-amount-input__input-container">
      <input
        v-bind="attrs"
        ref="inputRef"
        v-model="formattedValue"
        autocomplete="off"
        class="vc-base-amount-input__input"
        :class="[
          `vc-base-amount-input__input--${backgroundColor}`,
          {
            'vc-base-amount-input__input--error': hasError,
            'vc-base-amount-input__input--yield': state === 'yield',
          },
        ]"
        :placeholder="placeholder"
        :style="{
          paddingLeft: `${inputPaddingLeftPx}px`,
          paddingRight: `${inputPaddingRightPx}px`,
          borderRadius: `${borderRadius}px`,
        }"
        @keypress="preventAmountInputCharacters"
        @keyup="ensureCursorAfterDollar"
        @input="ensureCursorAfterDollar"
        @click="ensureCursorAfterDollar"
        @blur="validate"
      />

      <div
        ref="beforeSlotRef"
        class="vc-base-amount-input__slot vc-base-amount-input__slot--before"
      >
        <slot name="before">
          <BaseIcon
            v-if="beforeIcon"
            :name="beforeIcon"
            class="vc-base-amount-input__icon"
          />
        </slot>
      </div>

      <div
        ref="afterSlotRef"
        class="vc-base-amount-input__slot vc-base-amount-input__slot--after"
      >
        <slot
          name="after"
          :error-message="resolvedErrorMessage"
        />
      </div>
    </div>

    <transition
      name="text-fade"
      mode="out-in"
    >
      <slot
        name="error"
        :error-message="resolvedErrorMessage"
      >
        <BaseInputFeedback
          v-if="resolvedErrorMessage"
          :message="resolvedErrorMessage"
          variant="error"
          class="vc-base-amount-input__error-message"
        />
        <BaseText
          v-if="supportText && !hasError"
          variant="body-small-medium"
          class="vc-base-amount-input__support-text"
        >
          {{ supportText }}
        </BaseText>
      </slot>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.vc-base-amount-input {
  display: flex;
  flex-direction: column;
  position: relative;

  &__input {
    width: 100%;
    min-height: 68px;
    padding: 16px 0;
    border: 1px solid $color-base-black-10;
    font-size: 20px;
    font-weight: 700;
    transition: border-color 0.12s ease-in-out;

    &:focus {
      outline: 1px solid $color-primary-100;
    }

    &:not(&--error, &--yield):hover {
      border-color: $color-primary-30;
    }

    &--primary-5 {
      background-color: $color-primary-5;
    }

    &--white-100 {
      background-color: $color-base-white-100;
    }

    &-container {
      display: flex;
      align-items: center;
      position: relative;
    }

    &--yield {
      border-color: $color-status-yield;

      &:focus {
        outline: 1px solid $color-status-yield !important;
      }
    }

    &--error {
      border-color: $color-status-error !important;
      color: $color-status-error;
      background-color: $color-status-error-15;

      &::placeholder {
        color: rgba($color-status-error, 0.3);
      }

      &:focus {
        outline: 1px solid $color-status-error !important;
      }
    }
  }

  &__slot {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }

  &__slot--before {
    left: 20px;
  }

  &__slot--after {
    right: 20px;
  }

  &__icon {
    font-size: 26px;
    font-weight: 400;
    padding-right: 10px;
  }

  &__error-message {
    margin-top: 8px;
  }

  &__support-text {
    color: $color-primary-70;
    font-weight: 400;
    margin-top: 8px;
  }
}

.text-fade-enter-active {
  transition: all 0.2s ease-out;
}

.text-fade-leave-active {
  transition: all 0.2s ease-out;
}

.text-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

.text-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}

.text-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}

.text-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}
</style>
