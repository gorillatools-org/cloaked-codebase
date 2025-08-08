<script setup>
import { computed, watch } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import BaseOrb from "@/library/BaseOrb.vue";
import ExposureStatusRecordsProgressBar from "@/features/ExposureStatus/ExposureStatusRecordsProgressBar.vue";
import store from "@/store";
import { MONTHS } from "@/scripts/constants";
import { posthogCapture } from "@/scripts/posthog.js";
const enrollmentData = computed(() => {
  return store.getters["dataDelete/enrollmentData"] || {};
});

const nextScanDate = computed(() => {
  const nextScanDateTime = enrollmentData.value?.nextScanDate;
  if (nextScanDateTime) {
    const nextScan = new Date(nextScanDateTime);
    return `${MONTHS[nextScan.getMonth()].slice(0, 3)} ${nextScan.getDate()}`;
  }

  return null;
});

const progressStatus = computed(() => {
  if (!enrollmentData.value || !enrollmentData.value.latestScan) {
    return "default";
  }

  if (enrollmentData.value.totalRecordsRemoved === 0) {
    return "Scanning";
  }

  if (enrollmentData.value.latestScan.state?.is_complete === false) {
    return "Removing";
  }

  if (enrollmentData.value.latestScan.state?.is_complete === true) {
    return "Monitoring";
  }

  return "default";
});

watch(progressStatus, (newVal) => {
  if (newVal === "Scanning") {
    posthogCapture("dashboard_user_scanning_state");
  }

  if (newVal === "Removing") {
    posthogCapture("dashboard_user_removing_state");
  }

  if (newVal === "Monitoring") {
    posthogCapture("dashboard_user_monitoring_state");
  }
});

const progressStatusColor = computed(() => {
  if (progressStatus.value === "Scanning") {
    return "cloaked";
  }

  if (progressStatus.value === "Removing") {
    return "safe-zone-blue";
  }

  if (progressStatus.value === "Monitoring") {
    return "safe-zone-green";
  }

  return null;
});

const formatNumber = (num) => {
  return num ? new Intl.NumberFormat().format(num) : "0";
};
</script>

<template>
  <div class="exposure-status-records">
    <BaseOrb
      class="exposure-status-records__orb"
      :color="progressStatusColor"
    />

    <div class="exposure-status-records__header">
      <BaseIcon
        name="shield-tick"
        class="exposure-status-records__header-icon"
      />

      <BaseText
        variant="headline-3-medium"
        as="h3"
        class="exposure-status-records__header-title"
      >
        Exposure Status
      </BaseText>

      <BaseProgressTag :color="progressStatusColor">
        {{ progressStatus }}
      </BaseProgressTag>
    </div>

    <ExposureStatusRecordsProgressBar
      v-if="enrollmentData.totalRecordsRemoved > 0"
      :progressStatus="progressStatusColor"
    />

    <div class="exposure-status-records__content">
      <section
        v-if="enrollmentData.totalRecordsRemoved > 0"
        class="exposure-status-records__content-section"
      >
        <BaseText
          variant="headline-1-medium"
          as="h1"
          class="exposure-status-records__content-section-title"
        >
          {{ formatNumber(enrollmentData.totalItemsRemoved) }}
        </BaseText>

        <BaseText
          variant="body-2-semibold"
          as="p"
          class="exposure-status-records__content-section-description"
        >
          Removed
        </BaseText>
      </section>

      <section
        v-if="enrollmentData.totalRecordsRemoved > 0"
        class="exposure-status-records__content-section"
      >
        <BaseText
          variant="headline-1-medium"
          as="h1"
          class="exposure-status-records__content-section-title"
        >
          {{ nextScanDate }}
        </BaseText>

        <BaseText
          variant="body-2-semibold"
          as="p"
          class="exposure-status-records__content-section-description"
        >
          Next Scan
        </BaseText>
      </section>

      <section
        v-if="enrollmentData.totalRecordsRemoved === 0"
        class="exposure-status-records__content-section"
      >
        <BaseText
          variant="headline-1-medium"
          as="h1"
          class="exposure-status-records__content-section-title"
        >
          {{ formatNumber(enrollmentData.latestScan?.exposures_count) }}
        </BaseText>

        <BaseText
          variant="body-2-semibold"
          as="p"
          class="exposure-status-records__content-section-description"
        >
          Exposures Discovered
        </BaseText>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.exposure-status-records {
  margin-bottom: 32px;
  position: relative;

  &__orb {
    width: 500px;
    height: 500px;
    position: absolute;
    top: calc(-100% - 150px);
    left: 50%;
    z-index: -1;
    pointer-events: none;
    transform: translateX(-50%);
  }

  &__header {
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 16px;

    &-icon {
      width: 100%;
      font-size: 24px;
    }

    &-title {
      margin: 0;
      width: auto;
    }
  }

  &__content {
    margin-top: 24px;
    display: flex;
    flex-direction: row;
    gap: 50px;
    justify-content: flex-start;
  }
}
</style>
