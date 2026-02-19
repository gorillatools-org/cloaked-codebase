<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { BaseIconName } from "@/library/baseIconTypes";

interface Props {
  status: "loading" | "success" | "error";
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 90,
});

const loaderSvgRef = ref<SVGSVGElement | null>(null);
const progressCircleRef = ref<SVGCircleElement | null>(null);

const shouldShowIcon = computed(() => props.status !== "loading");

const iconName = computed<BaseIconName>(() => {
  if (props.status === "success") return "tick-circle";
  if (props.status === "error") return "info";
  return "tick-circle";
});

function freezeAtCurrentRotation() {
  const progressCircle = progressCircleRef.value;
  const loaderSvg = loaderSvgRef.value;
  if (!progressCircle || !loaderSvg) return;

  const { transform } = getComputedStyle(progressCircle);
  let currentAngle = 0;

  if (transform && transform !== "none") {
    try {
      const matrix = new DOMMatrixReadOnly(transform);
      currentAngle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
    } catch {
      const transformValues = transform.split("(")[1].split(")")[0].split(",");
      const matrixX = parseFloat(transformValues[0]);
      const matrixY = parseFloat(transformValues[1]);
      currentAngle = Math.atan2(matrixY, matrixX) * (180 / Math.PI);
    }
  }

  loaderSvg.style.transform = `rotate(${currentAngle - 90}deg)`;
  progressCircle.style.animation = "none";
}

function resetBaseRotation() {
  const loaderSvg = loaderSvgRef.value;
  const progressCircle = progressCircleRef.value;
  if (loaderSvg) loaderSvg.style.removeProperty("transform");
  if (progressCircle) progressCircle.style.removeProperty("animation");
}

watch(
  () => props.status,
  (nextStatus, previousStatus) => {
    if (
      previousStatus === "loading" &&
      (nextStatus === "success" || nextStatus === "error")
    ) {
      freezeAtCurrentRotation();
    } else if (nextStatus === "loading") {
      resetBaseRotation();
    }
  },
  { flush: "pre" }
);

onMounted(() => {
  if (props.status !== "loading") {
    resetBaseRotation();
  }
});
</script>

<template>
  <div
    class="vc-base-circular-loader"
    :class="`vc-base-circular-loader--${props.status}`"
    :style="{
      width: `${props.size}px`,
      height: `${props.size}px`,
      '--icon-size': `${props.size}px`,
    }"
  >
    <svg
      ref="loaderSvgRef"
      class="vc-base-circular-loader__svg"
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
    >
      <circle
        class="vc-base-circular-loader__circle vc-base-circular-loader__circle--track"
        cx="50"
        cy="50"
        r="45"
      />
      <circle
        ref="progressCircleRef"
        class="vc-base-circular-loader__circle vc-base-circular-loader__circle--progress"
        cx="50"
        cy="50"
        r="45"
      />
    </svg>

    <div class="vc-base-circular-loader__center">
      <BaseIcon
        v-if="shouldShowIcon"
        :name="iconName"
        class="vc-base-circular-loader__center-icon"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
$circ: 282.743;
$ease-fade: cubic-bezier(0.22, 1, 0.36, 1);

.vc-base-circular-loader {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &__svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    will-change: transform;
  }

  &__circle {
    fill: none;
    stroke-width: 8;

    &--track {
      stroke: $color-base-black-10;
    }

    &--progress {
      stroke: $color-primary-100;
      stroke-dasharray: #{$circ};
      stroke-dashoffset: #{round($circ * 0.75)};
      transform-origin: center;
      transition:
        stroke-dashoffset 180ms ease-in,
        stroke 240ms ease-in;
    }
  }

  &__center {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 84%;
    height: 84%;
    border-radius: 50%;
    opacity: 0.2;
    transform: scale(0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    transition:
      transform 420ms ease-out 240ms,
      opacity 220ms ease-out 240ms,
      background-color 140ms linear,
      color 140ms linear;
    will-change: transform, opacity;
  }

  &__center-icon {
    font-size: calc(var(--icon-size) * 0.56);
    opacity: 0.2;
    font-weight: 400;
    transform: translateY(8px) scale(0.2);
    color: white;
    transition:
      opacity 580ms $ease-fade 320ms,
      transform 580ms $ease-fade 320ms;
  }

  &--loading {
    .vc-base-circular-loader__circle--progress {
      animation: loading 0.8s linear infinite;
    }

    .vc-base-circular-loader__center {
      opacity: 0;
      transform: scale(0.9);
      background: transparent;
      color: transparent;
    }
  }

  &--success {
    .vc-base-circular-loader__circle--progress {
      stroke: $color-status-success;
      stroke-dashoffset: 0;
    }

    .vc-base-circular-loader__center {
      opacity: 1;
      transform: scale(1);
      background-color: $color-status-success;
      color: $color-base-white-0;
    }

    .vc-base-circular-loader__center-icon {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  &--error {
    .vc-base-circular-loader__circle--progress {
      stroke: $color-status-error;
      stroke-dashoffset: 0;
    }

    .vc-base-circular-loader__center {
      opacity: 1;
      transform: scale(1);
      background-color: $color-status-error;
      color: $color-base-white-0;
    }

    .vc-base-circular-loader__center-icon {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
