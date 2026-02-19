<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { useToast } from "@/composables/useToast.js";
import { tools } from "@/scripts/tools";

type Props = {
  label: string;
  mask: string; // Asterisk format
  unmaskedData: string;
  disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

let resetCopiedTimeout: number | undefined = undefined;

const toast = useToast();
const isHovered = ref(false);
const copied = ref(false);

onBeforeUnmount(() => {
  clearTimeout(resetCopiedTimeout);
});

// Inserts spaces into unmaskedData at the same positions as the mask,
// so that mask[index] and spacedUnmaskedData[index] stay in sync.
// e.g. mask "**** **** **** 3011" + data "4111111775723011" → "4111 1117 7572 3011"
const spacedUnmaskedData = computed(() => {
  const data = props.unmaskedData?.replace(/\s/g, "") ?? "";
  let i = 0;
  return props.mask.replace(/\S/g, () => data[i++] ?? "");
});

const getChar = (char: string) => {
  if (char === " ") return "\u00A0";
  if (char === "*") return "•";

  return char;
};

const isMaskedChar = (char: string) => {
  return char === "*";
};

function handleMouseEnter() {
  if (props.disabled) return;
  isHovered.value = true;
}

function handleMouseLeave() {
  if (props.disabled) return;

  isHovered.value = false;
  copied.value = false;
  clearTimeout(resetCopiedTimeout);
}

async function copy() {
  if (props.disabled) return;

  try {
    await tools.copyToClipboard(props.unmaskedData);
    toast.success("Copied to clipboard");
    copied.value = true;

    clearTimeout(resetCopiedTimeout);
    resetCopiedTimeout = window.setTimeout(() => {
      copied.value = false;
      resetCopiedTimeout = undefined;
    }, 1200);
  } catch (error) {
    console.error("Failed to copy:", error);
    toast.error("Failed to copy");
  }
}

watch(
  () => props.unmaskedData,
  () => {
    copied.value = false;
    clearTimeout(resetCopiedTimeout);
  }
);
</script>
<template>
  <div
    class="vc-wallet-card-masked-data"
    :class="{ 'vc-wallet-card-masked-data--disabled': disabled }"
  >
    <BaseText
      variant="caption-bold"
      class="vc-wallet-card-masked-data__label"
    >
      {{ label }}
    </BaseText>
    <div
      class="vc-wallet-card-masked-data__data-container"
      :class="{ 'vc-wallet-card-masked-data__data-container--copied': copied }"
      role="button"
      tabindex="0"
      @click="copy"
      @keydown.enter="copy"
      @keydown.space.prevent="copy"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <template
        v-for="(char, index) in mask"
        :key="index"
      >
        <div class="vc-wallet-card-masked-data__char-container">
          <span
            :class="{
              'vc-wallet-card-masked-data__masked-char': isMaskedChar(char),
            }"
          >
            {{ getChar(char) }}
          </span>
          <span
            v-if="isMaskedChar(char)"
            class="vc-wallet-card-masked-data__unmasked-char"
          >
            {{ spacedUnmaskedData[index] || getChar(char) }}
          </span>
        </div>
      </template>

      <span class="vc-wallet-card-masked-data__copy-icon">
        <transition
          name="vc-icon-switch"
          mode="out-in"
        >
          <BaseIcon
            v-if="isHovered && copied"
            key="tick"
            name="tick-circle-filled"
            class="vc-wallet-card-masked-data__icon"
            aria-hidden="true"
          />
          <BaseIcon
            v-else-if="isHovered"
            key="copy"
            class="vc-wallet-card-masked-data__icon"
            name="copy-filled"
            aria-hidden="true"
          />
        </transition>
      </span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.vc-wallet-card-masked-data {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: $color-white;

  &--disabled {
    cursor: default;
    pointer-events: none;
  }

  &__label {
    font-weight: 700;
  }

  &__data-container {
    position: relative;
    display: flex;
    width: max-content;
    align-items: center;
    background-color: $color-base-white-10;
    border: 1px solid $color-base-black-15;
    padding: 4px 10px;
    border-radius: 999px;
    cursor: pointer;
    transition:
      background-color 0.2s ease-out,
      padding-right 0.1s ease-in;

    .vc-wallet-card-masked-data--disabled & {
      border-color: transparent;
    }

    &:hover:not(&--copied) {
      background-color: $color-base-white-15;
      padding-right: 30px;
    }

    @at-root .theme-dark & {
      background-color: $color-base-black-10;

      &:hover:not(&--copied) {
        background-color: $color-base-black-15;
      }
    }

    &--copied {
      background-color: $color-base-white-30;

      &:hover {
        background-color: $color-base-white-30;
        padding-right: 30px;
      }

      @at-root .theme-dark & {
        background-color: $color-base-black-30;

        &:hover {
          background-color: $color-base-black-30;
        }
      }
    }
  }

  &__char-container {
    position: relative;
    font-size: 18px;
    font-variant-numeric: tabular-nums;
    font-family: "SF Mono", monospace;
  }

  &__masked-char {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.15s ease-out,
      filter 0.15s ease-out,
      transform 0.15s ease-out;

    .vc-wallet-card-masked-data__data-container:hover & {
      opacity: 0;
      filter: blur(3px);
      transform: translateY(3px);
    }
  }

  &__unmasked-char {
    opacity: 0;
    filter: blur(3px);
    transform: translateY(-3px);
    transition:
      opacity 0.15s ease-out,
      filter 0.15s ease-out,
      transform 0.15s ease-out;

    .vc-wallet-card-masked-data__data-container:hover & {
      opacity: 1;
      filter: blur(0);
      transform: translateY(0);
    }
  }

  &__copy-icon {
    position: absolute;
    right: 8px;
    display: inline-flex;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    opacity: 0;
    transform-origin: center;
    margin-left: 5px;
    transition: opacity 0.08s ease-out;
    transition-delay: 0.05s;

    .vc-wallet-card-masked-data__data-container:hover & {
      opacity: 1;
      transition: opacity 0.2s ease-out;
    }
  }

  &__icon {
    font-size: 15px;
    display: inline-block;
    will-change: opacity;
  }
}

.vc-icon-switch-enter-from,
.vc-icon-switch-leave-to {
  opacity: 0.6;
  filter: blur(1.2px);
  transform: translateY(1px) scale(0.8);
  transform-origin: center;
}

.vc-icon-switch-enter-to,
.vc-icon-switch-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
  transform-origin: center;
}

.vc-icon-switch-enter-active,
.vc-icon-switch-leave-active {
  transition:
    opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
