<script setup>
import { computed, onMounted, ref } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
  },
  width: {
    type: Number,
    default: 256,
  },
  animationDelay: {
    type: Number,
    default: 50,
  },
  hideIcon: {
    type: Boolean,
    default: false,
  },
});

const wasMounted = ref(false);

onMounted(() => {
  setTimeout(() => {
    wasMounted.value = true;
  }, props.animationDelay);
});

const internalProgress = computed(() =>
  wasMounted.value ? props.progress : 0
);

const indicatorDasharray = computed(
  () => `${Math.min(1, Math.max(0, internalProgress.value))} 1`
);

const warningIconStyle = computed(() => ({
  transform: `translate3d(calc(-50% + ${5 * (1 - internalProgress.value)}px + ${
    internalProgress.value * props.width
  }px), calc(-50% + 18px), 0)`,
}));
</script>

<template>
  <div class="threat-progress">
    <svg
      :width="props.width"
      height="10"
      :viewBox="`0 0 ${props.width} 10`"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="5"
        y1="5"
        :x2="props.width - 5"
        y2="5"
        stroke-width="10"
        stroke-linecap="round"
        class="threat-progress__background"
      />
      <line
        x1="5"
        y1="5"
        :x2="props.width - 5"
        y2="5"
        stroke-width="10"
        stroke-linecap="round"
        pathLength="1"
        stroke="url(#threat-gradient)"
        :stroke-dasharray="indicatorDasharray"
        class="threat-progress__indicator"
      />
      <defs>
        <linearGradient
          id="threat-gradient"
          x1="5"
          y1="5"
          :x2="props.width - 5"
          y2="5"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0"
            stop-color="#00C47D"
          />
          <stop
            offset="0.33"
            stop-color="#FFE600"
          />
          <stop
            offset="0.66"
            stop-color="#FF550C"
          />
          <stop
            offset="1"
            stop-color="#FF3B3B"
          />
        </linearGradient>
      </defs>
    </svg>
    <InlineSvg
      name="warning-filled"
      class="threat-progress__icon"
      :class="{ 'threat-progress__icon--hidden': hideIcon }"
      :style="warningIconStyle"
    />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.threat-progress {
  position: relative;

  &__indicator {
    transition: stroke-dasharray 500ms ease-in-out;
  }

  &__background {
    stroke: $color-primary-10;
  }

  &__icon {
    position: absolute;
    top: 0;
    left: 0;
    transition:
      transform 500ms ease-in-out,
      opacity 200ms ease-out;
    opacity: 1;

    &--hidden {
      opacity: 0;
    }
  }
}
</style>
