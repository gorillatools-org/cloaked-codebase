<script setup>
import { computed } from "vue";
const props = defineProps({
  progress: {
    type: Number,
    default: 0,
  },
  width: {
    type: Number,
    default: 256,
  },
  height: {
    type: Number,
    default: 4,
  },
});
const indicatorDasharray = computed(() => {
  return `${Math.min(1, Math.max(0, props.progress))} 1`;
});

const x1 = computed(() => props.height / 2);
const y1 = computed(() => props.height / 2);
const x2 = computed(() => props.width - props.height / 2);
const y2 = computed(() => props.height / 2);
</script>

<template>
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    xmlns="http://www.w3.org/2000/svg"
    class="progress-line"
  >
    <line
      :x1="x1"
      :y1="y1"
      :x2="x2"
      :y2="y2"
      :stroke-width="height"
      stroke-linecap="round"
      class="progress-line__background"
    />
    <line
      :x1="x1"
      :y1="y1"
      :x2="x2"
      :y2="y2"
      :stroke-width="props.height"
      stroke-linecap="round"
      pathLength="1"
      :stroke-dasharray="indicatorDasharray"
      class="progress-line__indicator"
    />
  </svg>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.progress-line {
  &__indicator {
    transition: stroke-dasharray 300ms ease-out;
    stroke: $color-primary-100;
  }

  &__background {
    stroke: $color-primary-10;
  }
}
</style>
