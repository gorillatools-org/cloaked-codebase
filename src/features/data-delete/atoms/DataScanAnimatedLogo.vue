<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import { computed } from "vue";

const props = defineProps({
  animationFinished: {
    type: Boolean,
    default: false,
  },
  delayOffset: {
    type: Number,
    default: 0,
  },
});

const transitionDelay = computed(() => {
  if (props.delayOffset === 0) {
    return "var(--transition-delay, 0s)";
  }
  return `calc(var(--transition-delay, 0s) + ${props.delayOffset}s)`;
});
</script>

<template>
  <InlineSvg
    name="cloaked-logo-full"
    class="data-scan-animated-logo"
    :class="{
      'data-scan-animated-logo--visible': animationFinished,
    }"
    :style="{ '--logo-transition-delay': transitionDelay }"
  />
</template>

<style scoped lang="scss">
.data-scan-animated-logo {
  position: absolute;
  left: 50%;
  top: 16px;
  transform: translateX(-50%);
  transform-origin: right center;
  height: 20px;
  opacity: 0;
  transition:
    opacity 0.3s cubic-bezier(0.075, 0.82, 0.165, 1),
    mask-position 3s cubic-bezier(0.075, 0.82, 0.165, 1);
  transition-delay: var(--logo-transition-delay, var(--transition-delay, 0s));
  mask-image: linear-gradient(
    45deg,
    transparent 0%,
    transparent 40%,
    black 60%,
    black 100%
  );
  mask-size: 300% 300%;
  mask-position: -4% 0%;
  mask-repeat: no-repeat;

  &--visible {
    opacity: 1;
    mask-position: 98% 100%;
  }
}
</style>
