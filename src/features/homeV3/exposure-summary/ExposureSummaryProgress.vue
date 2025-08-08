<script setup>
import { computed } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseIcon from "@/library/BaseIcon.vue";

const props = defineProps({
  progress: {
    type: Number,
    required: true,
    default: 0,
  },
  exposureCount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    validator: (value) => {
      return [
        "hasRemovals",
        "noRemovalsPre48Hours",
        "noRemovalsPost48Hours",
      ].includes(value);
    },
  },
});

// Circle properties
const radius = 48;
const circumference = 2 * Math.PI * radius;

const progressStyle = computed(() => {
  const progress = Math.max(0, Math.min(props.progress, 100));
  const offset = circumference - (progress / 100) * circumference;
  return {
    strokeDasharray: `${circumference}, ${circumference}`,
    strokeDashoffset: `${offset}`,
  };
});

const descriptionText = computed(() => {
  switch (props.status) {
    case "hasRemovals":
      return "Exposures removed";
    default:
      return "Exposures found";
  }
});
</script>

<template>
  <div class="exposure-summary-progress">
    <InlineSvg
      name="blob-blue-green"
      class="blob-icon"
    />
    <div class="progress-circle">
      <svg
        class="progress-ring"
        viewBox="0 0 100 100"
      >
        <defs>
          <radialGradient
            id="gradient"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(-107.017 43.161) rotate(80) scale(50.302 388.052)"
          >
            <stop
              offset="0.0097865"
              stop-color="rgba(141, 187, 255, 1)"
            />
            <stop
              offset="0.582589"
              stop-color="rgba(73, 255, 100, 1)"
            />
            <stop
              offset="1"
              stop-color="rgba(0, 186, 74, 1)"
            />
          </radialGradient>
        </defs>
        <circle
          class="static-gradient-circle"
          cx="50"
          cy="50"
          r="37"
          stroke="url(#gradient)"
          transform="rotate(90 50 50)"
        />

        <circle
          class="progress-ring__background"
          cx="50"
          cy="50"
          r="45"
        />
        <circle
          v-if="props.progress > 0"
          class="progress-ring__progress"
          :style="progressStyle"
          cx="50"
          cy="50"
          r="45"
        />
      </svg>
      <div class="progress-content">
        <InlineSvg
          v-if="status === 'hasRemovals'"
          name="data-delete/shield-gradient"
          class="icon-removals"
        />
        <InlineSvg
          v-else-if="exposureCount > 0"
          name="search-read"
          class="icon-removals"
        />
        <div
          v-else
          class="progress-content__icon"
        >
          <BaseIcon
            name="search"
            class="icon-search"
          />
          <div class="lines">
            <div class="line"></div>
            <div class="line short"></div>
            <div class="line"></div>
          </div>
        </div>

        <div
          v-if="exposureCount > 0"
          class="count"
        >
          {{ props.exposureCount }}
        </div>
        <div
          v-if="exposureCount > 0"
          class="description"
        >
          {{ descriptionText }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes animate-lines-1 {
  0% {
    opacity: 0;
    top: -5px;
  }
  50% {
    opacity: 1;
    top: 0px;
  }

  100% {
    opacity: 1;
    top: 0px;
  }
}

@keyframes animate-lines-2 {
  0% {
    opacity: 0;
    top: -5px;
  }
  25% {
    opacity: 1;
    top: 0px;
  }
  74% {
    opacity: 1;
    top: 0px;
  }
  75% {
    opacity: 0;
    top: 0px;
  }

  100% {
    opacity: 0;
    top: 0px;
  }
}

@keyframes animate-lines-3 {
  0% {
    opacity: 0;
    top: -5px;
  }
  25% {
    opacity: 1;
    top: 0px;
  }
  49% {
    opacity: 1;
    top: 0px;
  }
  50% {
    opacity: 0;
    top: 0px;
  }

  100% {
    opacity: 0;
    top: 0px;
  }
}
.exposure-summary-progress {
  width: 164px;
  height: 164px;
}

.blob-icon {
  width: 260px;
  height: 260px;
  animation: spin-blob 5s linear infinite;
  margin-top: -40px;
  margin-left: -50px;
}

.progress-circle {
  position: relative;
  width: 164px;
  height: 164px;
  margin-top: -220px;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.static-gradient-circle {
  fill: none;
  stroke-width: 4;
  r: 40;
  cx: 50;
  cy: 50;
}

.progress-ring__background,
.progress-ring__progress {
  fill: none;
  r: 48;
  cx: 50;
  cy: 50;
  stroke-width: 3;
}

.progress-ring__background {
  stroke: $color-primary-10;
}

.progress-ring__progress {
  stroke: $color-accent;
  transition: stroke-dashoffset 0.3s ease;
  stroke-linecap: round;
}

.progress-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background-color: $color-base-white-100;
  border-radius: 50%;
  height: 130px;
  width: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;

  .icon-removals {
    width: 30px;
    height: 30px;
    margin-top: -12px;
    margin-bottom: 8px;
    color: $color-primary-100;
  }
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 70px;
    width: 70px;
    .icon-search {
      font-size: 60px;
      margin-top: -22px;
      color: $color-primary-100;
    }

    .lines {
      height: 30px;
      margin-top: -40px;
      margin-left: -3px;
      .line {
        position: relative;
        border-radius: 999px;
        height: 2px;
        width: 24px;
        background-color: $color-primary-100;
        margin-bottom: 5px;

        &:nth-of-type(1) {
          animation-delay: 0s;
          animation-duration: 2s;
          animation-name: animate-lines-1;
          animation-iteration-count: infinite;
        }
        &:nth-of-type(2) {
          animation-delay: 0.5s;
          animation-duration: 2s;
          animation-name: animate-lines-2;
          animation-iteration-count: infinite;
        }
        &:nth-of-type(3) {
          animation-delay: 1s;
          animation-duration: 2s;
          animation-name: animate-lines-3;
          animation-iteration-count: infinite;
        }
        &.short {
          width: 20px;
        }
      }
    }
  }
}

.count {
  font-size: 32px;
  font-weight: 600;
  line-height: 20px;
  color: $color-primary-100;
}

.description {
  font-size: 12px;
  font-weight: 600;
  line-height: 12px;
  color: $color-primary-100;
  margin-top: 8px;
  max-width: 100px;
}
</style>
