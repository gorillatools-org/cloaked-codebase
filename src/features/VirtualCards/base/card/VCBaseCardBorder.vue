<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { useMouse } from "@vueuse/core";

export type VCBaseCardBorderProps = {
  enableSpotlight?: boolean;
  borderRadius?: string | number;
  focused?: boolean;
  loading?: boolean;
  clickable?: boolean;
};

const props = withDefaults(defineProps<VCBaseCardBorderProps>(), {
  enableSpotlight: false,
  focused: false,
  borderRadius: 16,
  loading: false,
  clickable: false,
});

const cardRef = useTemplateRef<HTMLElement>("cardRef");
const { x, y } = useMouse({ type: "client" });

const _borderRadius = computed(() => {
  if (typeof props.borderRadius === "number") {
    return `${props.borderRadius}px`;
  }
  return props.borderRadius;
});

const cursorStyle = computed(() => {
  const el = cardRef.value;
  if (!el || !props.enableSpotlight || props.loading) return {};

  const rect = el.getBoundingClientRect();
  const left = x.value - rect.left;
  const top = y.value - rect.top;

  return { left: `${left}px`, top: `${top}px` };
});
</script>

<template>
  <div
    ref="cardRef"
    class="vc-base-card-border"
    :style="{ '--vc-base-card-border-radius': _borderRadius }"
    :class="{
      'vc-base-card-border--focused': props.focused && !props.loading,
      'vc-base-card-border--loading': props.loading,
      'vc-base-card-border--spotlight': props.enableSpotlight,
      'vc-base-card-border--clickable': props.clickable,
    }"
  >
    <span
      v-if="props.enableSpotlight || props.loading"
      class="vc-base-card-border__cursor"
      :style="cursorStyle"
    />
    <slot />
  </div>
</template>

<style scoped lang="scss">
.vc-base-card-border {
  position: relative;
  border-radius: var(--vc-base-card-border-radius);

  &:not(.vc-base-card-border--spotlight) {
    border: 1px solid $color-base-black-10;
  }

  &--spotlight {
    background-color: $color-base-black-10;
    padding: 1.3px; // Fake border

    &[class*="vc-base-card-border--focused"] {
      background-color: $color-primary-70;
      transition: background-color 0.4s ease-in;
      transition-delay: 0.4s;
    }

    &:not(.vc-base-card-border--focused, .vc-base-card-border--loading) {
      &[class*="vc-base-card-border--clickable"] {
        cursor: pointer;
        transition: background-color 0.1s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          background-color: $color-primary-30;
        }
      }
    }
  }

  &--loading,
  &--focused,
  &--spotlight {
    overflow: hidden;
  }

  &--focused:not(.vc-base-card-border--spotlight) {
    border-color: $color-primary-70;
    transition: border-color 0.15s ease-in;
  }

  &--clickable:not(
      .vc-base-card-border--focused,
      .vc-base-card-border--loading,
      .vc-base-card-border--spotlight
    ) {
    cursor: pointer;
    transition: border-color 0.1s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      border-color: $color-primary-30;
    }
  }

  &__cursor {
    position: absolute;
    width: 60px;
    height: 60px;
    filter: blur(30px);
    background-color: $color-primary-70;
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition:
      background-color 0.12s ease-in,
      width 0.2s ease-in,
      height 0.2s ease-in;

    .vc-base-card-border--loading & {
      left: 0%;
      top: 0%;
      width: 130px;
      height: 180px;
      background-color: $color-primary-100;
      animation: loading 1.7s linear infinite;
    }

    .vc-base-card-border--focused & {
      width: 100vw;
      height: 100vh;
      transition:
        width 0.4s ease-in-out,
        height 0.4s ease-in-out;
    }

    .vc-base-card-border:not(.vc-base-card-border--focused):hover & {
      width: 130px;
      height: 180px;
    }
  }
}

@keyframes loading {
  0% {
    left: 0%;
    top: 0%;
  }

  25% {
    left: 100%;
    top: 0%;
  }

  50% {
    left: 100%;
    top: 100%;
  }

  75% {
    left: 0%;
    top: 100%;
  }

  100% {
    left: 0%;
    top: 0%;
  }
}
</style>
