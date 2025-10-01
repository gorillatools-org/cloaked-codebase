<script setup>
import { computed } from "vue";

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
  },
  size: {
    type: Number,
    default: 20,
  },
  stroke: {
    type: Number,
    default: 3,
  },
  antiClockWise: {
    type: Boolean,
    default: false,
  },
});

const strokeWidth = computed(() => props.stroke / (props.size / 20));

const indicatorDasharray = computed(
  () => `${Math.min(1, Math.max(0, props.progress))} 1`
);
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="progress"
    :class="{ 'progress--anti-clockwise': antiClockWise }"
  >
    <path
      d="M18.5 10C18.5 14.6944 14.6944 18.5 10 18.5C5.30558 18.5 1.5 14.6944 1.5 10C1.5 5.30558 5.30558 1.5 10 1.5C14.6944 1.5 18.5 5.30558 18.5 10Z"
      :stroke-width="strokeWidth"
      class="progress__background"
    />
    <path
      d="M18.5 10C18.5 14.6944 14.6944 18.5 10 18.5C5.30558 18.5 1.5 14.6944 1.5 10C1.5 5.30558 5.30558 1.5 10 1.5C14.6944 1.5 18.5 5.30558 18.5 10Z"
      :stroke-width="strokeWidth"
      pathLength="1"
      transform="rotate(-90 10 10)"
      :stroke-dasharray="indicatorDasharray"
      class="progress__indicator"
    />
  </svg>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.progress {
  &--anti-clockwise {
    transform: scaleX(-1);
  }

  &__indicator {
    transition: all 300ms ease-out;
    stroke: $color-success;
  }

  &__background {
    stroke: $color-primary-30;
  }
}
</style>
