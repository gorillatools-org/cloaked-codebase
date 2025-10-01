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

defineOptions({
  inheritAttrs: false,
});

type Props = {
  placeholder?: string;
  beforeIcon?: BaseIconName | null;
  borderRadius?: number;
  inputError?: boolean;
  errorMessage?: string;
};

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Amount",
  beforeIcon: null,
  borderRadius: 16,
  inputError: false,
  errorMessage: undefined,
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

const formattedValue = computed<string>({
  get() {
    return model.value ? `$${model.value}` : "";
  },
  set(raw: string) {
    model.value = sanitizeAmount(raw);
  },
});

function updateSlotWidths() {
  leftSlotWidthPx.value = beforeSlotRef.value
    ? Math.ceil(beforeSlotRef.value.getBoundingClientRect().width)
    : 0;
  rightSlotWidthPx.value = afterSlotRef.value
    ? Math.ceil(afterSlotRef.value.getBoundingClientRect().width)
    : 0;
}

function sanitizeAmount(raw: string): number {
  let cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return 0;

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

function preventAmountInputCharacters(event: KeyboardEvent) {
  const { key } = event;
  const input = event.target as HTMLInputElement | null;
  if (!input) return;
  const controlKeys = ["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"];

  if (controlKeys.includes(key)) return;

  // Prevent non-numeric and non-decimal characters
  if (!/[\d.]/.test(key)) {
    event.preventDefault();
    return;
  }

  const { value, selectionStart, selectionEnd } = input;
  const start = selectionStart ?? value.length;
  const end = selectionEnd ?? value.length;

  // Disallow '0' as the first numeric character (allow if immediately followed by '.')
  if (key === "0") {
    const nextRaw = value.slice(0, start) + key + value.slice(end);
    const nextSanitized = nextRaw.replace(/[^\d.]/g, "");
    const nextParts = nextSanitized.split(".");
    const nextInteger = nextParts[0] ?? "";
    const hasDot = nextSanitized.includes(".");
    if (
      (start === 0 && nextInteger === "0" && !hasDot) ||
      (nextInteger === "0" && !hasDot && nextSanitized.length === 1)
    ) {
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

watch([() => props.beforeIcon], async () => {
  await nextTick();
  updateSlotWidths();
});

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  input: inputRef,
});
</script>

<template>
  <div class="vc-base-amount-input">
    <div class="vc-base-amount-input__input-container">
      <input
        v-bind="attrs"
        ref="inputRef"
        v-model="formattedValue"
        class="vc-base-amount-input__input"
        :class="{ 'vc-base-amount-input__input--error': inputError }"
        :placeholder="placeholder"
        :style="{
          paddingLeft: `${inputPaddingLeftPx}px`,
          paddingRight: `${inputPaddingRightPx}px`,
          borderRadius: `${borderRadius}px`,
        }"
        @keypress="preventAmountInputCharacters"
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
        <slot name="after" />
      </div>
    </div>

    <transition name="text-fade">
      <slot
        name="error"
        :error-message="errorMessage"
      >
        <BaseInputFeedback
          v-if="errorMessage"
          :message="errorMessage"
          variant="error"
          class="vc-base-amount-input__error-message"
        />
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
    min-height: 65px;
    padding: 16px 0;
    border: 1px solid $color-base-black-10;
    background-color: $color-primary-5;
    font-size: 20px;
    font-weight: 700;
    transition: border-color 0.12s ease-in-out;

    &-container {
      display: flex;
      align-items: center;
      position: relative;
    }

    &--error {
      border-color: $color-status-error !important;
      color: $color-status-error;
      background-color: $color-status-error-15;

      &::placeholder {
        color: rgba($color-status-error, 0.3);
      }

      &:focus {
        border-color: none;
        outline-color: $color-status-error !important;
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
    left: 16px;
  }

  &__slot--after {
    right: 16px;
  }

  &__icon {
    font-size: 32px;
  }

  &__error-message {
    margin-top: 8px;
  }
}

.text-fade-enter-active {
  transition: all 0.3s ease-in-out;
}

.text-fade-leave-active {
  transition: all 0.3s ease-in-out;
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
