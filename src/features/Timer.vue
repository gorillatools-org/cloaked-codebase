<script setup>
import { computed, ref, onBeforeMount, onBeforeUnmount } from "vue";
import UiTooltip from "@/features/ui/ui-tooltip";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

const props = defineProps({
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
  isOnSharedPage: {
    type: Boolean,
    default: false,
  },
  isOneTimeView: {
    type: Boolean,
    default: false,
  },
});

let intervalUpdateTimer = null;

onBeforeMount(() => {
  intervalUpdateTimer = setInterval(() => {
    timeNow.value = new Date();
  }, 15000);
});

onBeforeUnmount(() => {
  clearInterval(intervalUpdateTimer);
});

const timeNow = ref(new Date());

const differenceInDays = computed(() => {
  const end = new Date(props.endDate);
  const diff = Math.abs(end - timeNow.value);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

const differenceInHours = computed(() => {
  const end = new Date(props.endDate);
  const diff = Math.abs(end - timeNow.value);
  return Math.floor(diff / (1000 * 60 * 60));
});

const differenceInMinutes = computed(() => {
  const end = new Date(props.endDate);
  const diff = Math.abs(end - timeNow.value);
  return Math.floor(diff / (1000 * 60));
});

const percentageOfTimePassed = computed(() => {
  const start = new Date(props.startDate);
  const end = new Date(props.endDate);
  const diff = Math.abs(end - start);
  const diffNow = Math.abs(end - timeNow.value);
  return Math.ceil((diffNow / diff) * 100);
});

const isCloseToExpiring = computed(() => {
  return (
    percentageOfTimePassed.value > 25 && percentageOfTimePassed.value <= 50
  );
});

const isVeryCloseToExpiring = computed(() => {
  return percentageOfTimePassed.value <= 25;
});

const tooltipText = computed(() => {
  if (props.isOneTimeView) {
    return "This link can only be viewed once";
  }

  const dateString = new Date(props.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeString = new Date(props.endDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
  });

  return `This link will expire on ${dateString} at ${timeString}`;
});

const timerNumber = computed(() => {
  if (props.isOneTimeView) {
    return "1";
  }

  // if endDate is in the past, return 0
  if (timeNow.value > new Date(props.endDate)) {
    return "0";
  }

  return differenceInDays.value >= 1
    ? differenceInDays.value
    : differenceInHours.value >= 1
      ? differenceInHours.value
      : differenceInMinutes.value;
});

const timerUnit = computed(() => {
  if (props.isOneTimeView) {
    return "time";
  }

  return differenceInDays.value >= 1
    ? `day${differenceInDays.value === 1 ? "" : "s"}`
    : differenceInHours.value >= 1
      ? `hr${differenceInHours.value === 1 ? "" : "s"}`
      : `min${differenceInMinutes.value === 1 ? "" : "s"}`;
});

const { isMobile } = useDisplay();
</script>
<template>
  <UiTooltip
    :title="tooltipText"
    width="192"
    align-x="center"
    position="top"
    :is-on-shared-page="isOnSharedPage"
  >
    <div class="timer">
      <div class="timer__timer">
        <svg viewBox="0 0 40 40">
          <g
            transform="translate(20 20) rotate(-90)"
            stroke-width="2"
            fill="none"
          >
            <circle
              class="timer__circle-container"
              r="18"
              :class="{ 'timer__circle-container--default': isOnSharedPage }"
            />
            <circle
              class="timer__circle-fill"
              :class="{
                'timer__circle-fill--default': isOnSharedPage,
                'timer__circle-fill--yellow':
                  isCloseToExpiring && !isOneTimeView,
                'timer__circle-fill--red':
                  isVeryCloseToExpiring && !isOneTimeView,
              }"
              r="18"
              :style="{
                strokeDashoffset: isOneTimeView
                  ? 0
                  : 113 - (113 * percentageOfTimePassed) / 100 + 'px',
              }"
            />
          </g>
          <BaseText
            as="text"
            variant="body-3-semibold"
            class="timer__text"
            :class="{
              'timer__text--default': isOnSharedPage,
              'timer__text--yellow': isCloseToExpiring && !isOneTimeView,
              'timer__text--red': isVeryCloseToExpiring && !isOneTimeView,
            }"
            x="20"
            y="15"
          >
            {{ timerNumber }}
          </BaseText>
          <BaseText
            as="text"
            :variant="isMobile ? 'label-medium' : 'caption-semibold'"
            class="timer__text timer__unit"
            :class="{
              'timer__text--default': isOnSharedPage,
              'timer__text--yellow': isCloseToExpiring && !isOneTimeView,
              'timer__text--red': isVeryCloseToExpiring && !isOneTimeView,
            }"
            x="20"
            y="23"
          >
            {{ timerUnit }}
          </BaseText>
        </svg>
      </div>
    </div>
  </UiTooltip>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.timer {
  display: flex;
  align-items: center;
  gap: 8px;

  &__timer {
    height: 60px;
    width: 60px;
    flex-shrink: 0;
  }

  &__circle-fill {
    stroke: $color-primary-100;
    stroke-dasharray: 113px;
    stroke-dashoffset: 40px;

    &--default {
      stroke: $color-background-light;
    }

    &--yellow {
      stroke: $color-warning;
    }

    &--red {
      stroke: $color-alert;
    }
  }

  &__circle-container {
    stroke: $color-primary-1;

    &--default {
      stroke: $color-primary-50-light;
    }
  }

  &__text {
    fill: $color-primary-100;
    dominant-baseline: middle;
    text-anchor: middle;

    &--default {
      fill: $color-background-light;
    }

    &--yellow {
      fill: $color-warning;
    }

    &--red {
      fill: $color-alert;
    }
  }

  &__unit {
    dominant-baseline: hanging;
    text-anchor: middle;
  }
}
</style>
