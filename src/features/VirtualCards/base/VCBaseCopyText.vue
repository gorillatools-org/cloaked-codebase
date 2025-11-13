<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { useToast } from "@/composables/useToast.js";
import BaseIcon from "@/library/BaseIcon.vue";
import { tools } from "@/scripts/tools";

type Props = {
  value: string;
  label?: string;
  toastMessage?: string;
};

const props = defineProps<Props>();

let resetCopiedTimeout: number | undefined = undefined;

const toast = useToast();
const isHovered = ref(false);
const copied = ref(false);

onBeforeUnmount(() => {
  clearTimeout(resetCopiedTimeout);
});

function handleMouseEnter() {
  isHovered.value = true;
}

function handleMouseLeave() {
  isHovered.value = false;
  copied.value = false;
  clearTimeout(resetCopiedTimeout);
}

async function copy() {
  try {
    await tools.copyToClipboard(props.value);
    toast.success(props.toastMessage || "Copied to clipboard");
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
  () => props.value,
  () => {
    copied.value = false;
    clearTimeout(resetCopiedTimeout);
  }
);
</script>

<template>
  <div class="vc-base-copy-text">
    <button
      type="button"
      class="vc-base-copy-text__value"
      :aria-label="`Copy ${props.label || 'value'}`"
      @click="copy"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <span class="vc-base-copy-text__value-text">
        {{ props.label || props.value }}
      </span>

      <span
        class="vc-base-copy-text__icons"
        :class="{ 'vc-base-copy-text__icons--visible': isHovered }"
      >
        <transition
          name="vc-icon-switch"
          mode="out-in"
        >
          <BaseIcon
            v-if="isHovered && copied"
            key="tick"
            name="check-square"
            class="vc-base-copy-text__icon"
            aria-hidden="true"
          />
          <BaseIcon
            v-else-if="isHovered"
            key="copy"
            class="vc-base-copy-text__icon"
            name="copy"
            aria-hidden="true"
          />
        </transition>
      </span>

      <!-- Accessibility: screen readers get a polite announcement -->
      <span
        class="sr-only"
        aria-live="polite"
      >
        {{ copied ? "Copied to clipboard" : "" }}
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.vc-base-copy-text {
  text-align: center;

  &__value {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 13px;
    color: $color-primary-50;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.1s ease-in;

    &:hover {
      background-color: $color-primary-10;
    }
  }

  &__value-text {
    display: inline-block;
  }

  &__icons {
    position: relative;
    display: inline-flex;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    opacity: 0.4;
    transform: translateX(-6px);
    transition:
      opacity 0.1s ease-out,
      transform 0.1s ease-out;

    &--visible {
      opacity: 1;
      transform: translateX(0);
      transition-delay: 0.05s;
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

/* Reduced motion: skip animations */
@media (prefers-reduced-motion: reduce) {
  .vc-icon-switch-enter-active,
  .vc-icon-switch-leave-active {
    transition-duration: 1ms;
  }
}

.sr-only:not(:focus, :active) {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
</style>
