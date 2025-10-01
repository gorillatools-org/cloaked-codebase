<script setup>
import { computed } from "vue";
import store from "@/store";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  progressStatus: {
    type: String,
    default: "default",
    validator: (value) =>
      [
        "default",
        "scanning",
        "removing",
        "removed",
        "action_required",
        "no_records_found",
        "blue",
        "green",
        "orange",
      ].includes(value),
  },
});

const enrollmentData = computed(() => {
  return store.getters["dataDelete/enrollmentData"] || {};
});

const currentScanDay = computed(() => {
  const scanUpdatedDate = enrollmentData.value?.latestScan?.array_started_at;
  const currentDate = new Date();

  if (scanUpdatedDate) {
    const scanStartDate = new Date(scanUpdatedDate);
    const diffTime = Math.abs(currentDate - scanStartDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  return 0;
});

const totalDays = computed(() => {
  const scanUpdatedDate = enrollmentData.value?.latestScan?.array_started_at;
  const nextScanDate = enrollmentData.value?.nextScanDate;

  if (scanUpdatedDate && nextScanDate) {
    const scanStartDate = new Date(scanUpdatedDate);
    const scanEndDate = new Date(nextScanDate);
    const diffTime = Math.abs(scanEndDate - scanStartDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  return null;
});

const progressPercentage = computed(() => {
  if (currentScanDay.value && totalDays.value && totalDays.value > 0) {
    const progress = (currentScanDay.value / totalDays.value) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
  return 0;
});
</script>

<template>
  <div class="exposure-status-records-progress-bar">
    <div class="exposure-status-records-progress-bar__text">
      <BaseText
        variant="caption-bold"
        as="span"
        class="exposure-status-records-progress-bar__text-title"
      >
        Day {{ currentScanDay }}
      </BaseText>
      <BaseText
        variant="caption-bold"
        as="span"
        class="exposure-status-records-progress-bar__text-date"
      >
        Next Scan
      </BaseText>
    </div>
    <div class="exposure-status-records-progress-bar__bar">
      <div
        class="exposure-status-records-progress-bar__fill"
        :class="`exposure-status-records-progress-bar__fill--${props.progressStatus}`"
        :style="{ width: `${progressPercentage}%` }"
      ></div>
      <div class="exposure-status-records-progress-bar__dashes">
        <div
          v-for="day in 90"
          :key="day"
          class="exposure-status-records-progress-bar__dashes-dash"
          :class="`exposure-status-records-progress-bar__dashes-dash--${props.progressStatus}`"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.exposure-status-records-progress-bar {
  width: 100%;
  margin-top: 16px;

  &__text {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    &-date {
      opacity: 0.5;
    }
  }

  &__bar {
    height: 14px;
    position: relative;
    margin-top: 10px;
    width: 100%;
  }

  &__fill {
    height: 100%;
    background-color: $color-safe-zone-blue;
    border-radius: 1px;
    transition: width 0.3s ease;
    position: absolute;
    top: 50%;
    left: 4px;
    transform: translateY(-50%);
    z-index: 1;

    &--blue {
      background-color: $color-safe-zone-blue;
    }

    &--green {
      background-color: $color-safe-zone-green;
    }

    &--orange {
      background-color: $color-cloaked;
    }

    &:before,
    &:after {
      content: "";
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: calc(100% + 10px);
      width: 2px;
      background-color: inherit;
      border-radius: 1px;
    }

    &::before {
      left: -4px;
    }

    &::after {
      right: -4px;
    }
  }

  &__dashes {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 2px;

    &-dash {
      width: 2px;
      height: 100%;
      background-color: $color-primary-20;
      border-radius: 1px;
    }
  }
}
</style>
