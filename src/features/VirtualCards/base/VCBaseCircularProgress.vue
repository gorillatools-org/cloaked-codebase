<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { debounce } from "lodash-es";

type ClassValue =
  | string
  | Record<string, boolean>
  | (string | Record<string, boolean>)[];

export type ExtraProgress = {
  progress: number;
  color: string;
  class?: ClassValue;
  style?: Record<string, string>;
  strokeWidth?: number;
  startAtPercent?: number;
};

type Props = {
  progress: number;
  size: number;
  stroke: number;
  animateOnMount?: boolean;
  extraProgresses?: ExtraProgress[];
  debounceTimeout?: number;
};

const props = withDefaults(defineProps<Props>(), {
  size: 30,
  stroke: 3,
  animateOnMount: true,
  extraProgresses: () => [],
  debounceTimeout: 0,
});

const VIEW_BOX_SIZE = 100;
const animatedProgress = ref(props.animateOnMount ? 0 : props.progress);
const animatedExtraProgresses = ref<number[]>(
  props.extraProgresses.map((extra) =>
    props.animateOnMount ? 0 : extra.progress
  )
);

onMounted(() => {
  if (props.animateOnMount) {
    requestAnimationFrame(() => {
      animatedProgress.value = props.progress;
      setAnimatedExtraProgresses();
    });
  }
});

onUnmounted(() => {
  debouncedUpdateProgress.cancel();
  debouncedUpdateExtraProgresses.cancel();
});

const setAnimatedExtraProgresses = () => {
  props.extraProgresses.forEach((extra, index) => {
    animatedExtraProgresses.value[index] = extra.progress;
  });
};

const debouncedUpdateProgress = debounce((newProgress: number) => {
  animatedProgress.value = newProgress;
}, props.debounceTimeout);

const debouncedUpdateExtraProgresses = debounce(() => {
  setAnimatedExtraProgresses();
}, props.debounceTimeout);

const getRadius = (strokeWidth: number) => VIEW_BOX_SIZE / 2 - strokeWidth / 2;

const getRotationTransform = (startAtPercent: number = 0) => {
  return `rotate(${-90 + (startAtPercent / 100) * 360}deg)`;
};

const getCircumference = (strokeWidth: number) => {
  return 2 * Math.PI * getRadius(strokeWidth);
};

const getStrokeDashoffset = (
  progress: number,
  strokeWidth: number,
  startAtPercent: number = 0
) => {
  const circumference = getCircumference(strokeWidth);
  return circumference - ((progress - startAtPercent) / 100) * circumference;
};

const getExtraProgressTransitionDuration = (
  extraProgress: ExtraProgress,
  index: number
) => {
  return extraProgress.progress > props.progress
    ? `${0.5 * (1 + (index + 1) * 0.1)}s`
    : `${0.3}s`;
};

watch(
  () => props.progress,
  (newProgress) => {
    debouncedUpdateProgress(newProgress);
  }
);

watch(
  () => props.extraProgresses,
  (newExtras) => {
    // Synchronize array length
    while (animatedExtraProgresses.value.length < newExtras.length) {
      animatedExtraProgresses.value.push(0);
    }

    if (animatedExtraProgresses.value.length > newExtras.length) {
      animatedExtraProgresses.value.splice(newExtras.length);
    }

    debouncedUpdateExtraProgresses();
  },
  { deep: true }
);
</script>
<template>
  <div class="vc-circular-progress">
    <svg
      class="vc-circular-progress__container"
      :viewBox="`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`"
    >
      <circle
        class="vc-circular-progress__background"
        cx="50"
        cy="50"
        :r="getRadius(props.stroke)"
      />
      <circle
        v-for="(extraProgress, index) in props.extraProgresses"
        :key="index"
        :class="['vc-circular-progress__extra', extraProgress.class]"
        cx="50"
        cy="50"
        :r="getRadius(extraProgress.strokeWidth || props.stroke)"
        :stroke-dasharray="
          getCircumference(extraProgress.strokeWidth || props.stroke)
        "
        :stroke-dashoffset="
          getStrokeDashoffset(
            animatedExtraProgresses[index] || 0,
            extraProgress.strokeWidth || props.stroke,
            extraProgress.startAtPercent
          )
        "
        :style="{
          '--transition-duration': getExtraProgressTransitionDuration(
            extraProgress,
            index
          ),
          stroke: extraProgress.color,
          strokeWidth: `${extraProgress.strokeWidth || props.stroke}px`,
          transform: getRotationTransform(extraProgress.startAtPercent),
          ...extraProgress.style,
        }"
      />
      <circle
        class="vc-circular-progress__indicator"
        cx="50"
        cy="50"
        :r="getRadius(props.stroke)"
        :stroke-dasharray="getCircumference(props.stroke)"
        :stroke-dashoffset="getStrokeDashoffset(animatedProgress, props.stroke)"
      />
    </svg>
    <div class="vc-circular-progress__content">
      <slot />
    </div>
  </div>
</template>
<style scoped lang="scss">
$size: v-bind('props.size + "px"');
$stroke: v-bind('props.stroke + "px"');

.vc-circular-progress {
  position: relative;
  width: $size;
  height: $size;

  &__container {
    width: $size;
    height: $size;
  }

  &__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__background {
    stroke: $color-base-black-15;
    stroke-width: $stroke;
    fill: none;
  }

  &__indicator {
    stroke: $color-safe-zone-blue;
    stroke-width: $stroke;
    fill: none;
    transform: rotate(-90deg); // Clockwise rotation
    transform-origin: center;
    transition: stroke-dashoffset 0.5s ease-out;
  }

  &__extra {
    fill: none;
    transform-origin: center;
    transition: stroke-dashoffset var(--transition-duration, 0.5s) ease-out;
  }
}
</style>
