<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import { useMouse } from "@vueuse/core";

export type VCBaseCardBorderProps = {
  enableSpotlight?: boolean;
  borderRadius?: string | number;
  focused?: boolean;
  loading?: boolean;
};

const props = withDefaults(defineProps<VCBaseCardBorderProps>(), {
  enableSpotlight: false,
  focused: false,
  borderRadius: 16,
  loading: false,
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
  background-color: $color-base-black-10;
  overflow: hidden;
  padding: 1px;
  border-radius: var(--vc-base-card-border-radius);

  &--focused {
    background-color: $color-primary-100;
    transition: background-color 0.4s ease-in;
    transition-delay: 0.4s;
  }

  &__cursor {
    position: absolute;
    width: 60px;
    height: 60px;
    filter: blur(30px);
    background-color: $color-primary-100;
    border-radius: 50%;
    pointer-events: none;
    transform: translate(-50%, -50%);
    transition:
      width 0.3s ease-in-out,
      height 0.3s ease-in-out;

    .vc-base-card-border--loading & {
      left: 0%;
      top: 0%;
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
