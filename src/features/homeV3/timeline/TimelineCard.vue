<script setup>
import { computed } from "vue";
import TimelineButton from "@/features/homeV3/timeline/TimelineButton.vue";
import TimelineSection from "@/features/homeV3/timeline/TimelineSection.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import store from "@/store";
import BaseButton from "@/library/BaseButton.vue";
import { isMobileDevice } from "@/scripts/regex";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";

const props = defineProps({
  timelineData: {
    type: Object,
    required: false,
    default: null,
  },
});

const summary = computed(() => {
  return store.getters["dataDelete/getBasicModeSummary"];
});

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Calculate total days for each scan
function calculateDayRange(index) {
  const startDay = index * 30 + 1;
  const endDay = (index + 1) * 30;
  return { startDay, endDay };
}

const timelineCardData = computed(() => {
  const data = [];
  const scans = Object.values(props.timelineData);

  scans.forEach((scan, index) => {
    const item = {
      button: {
        text: "",
      },
      sections: [],
    };

    const { startDay, endDay } = calculateDayRange(index);
    const scanDate = scan.scan_date;
    const formattedDate = formatDate(scanDate);
    const currentScan = startDay <= 30 && endDay >= 30;

    if (!scan.exposures_found) {
      item.button.text = `Next scan: ${formattedDate}`;
    } else {
      if (currentScan) {
        item.button.text = `Current scan`;
      } else {
        item.button.text = `Scan: ${formattedDate}`;
      }
    }

    const sections = [];

    if (scan.exposures_found !== null && scans.length > 1) {
      // Initial section
      sections.push({
        exposures: scan.exposures_found,
        text: "Cloaked is actively removing your exposed data. You're on track to reduce hackers, scammers, and stalkers from seeing your data online.",
        hasOnClick: scan.exposures_found > 0,
        day: startDay,
      });

      // Mid-point section
      if (scan.mid_point) {
        const exposureInfo = scan.mid_point.exposure_info;
        const totalExposuresRemoved = scan.mid_point.total_exposures_removed;

        sections.push({
          exposures: -totalExposuresRemoved,
          callout: {
            title: `${exposureInfo.records_removed} copies of your ${exposureInfo.type} were removed`,
            description:
              "Your phone number is just as revealing as your social security number (that's how Cloaked was able to find it!)",
            percent: exposureInfo.statistic,
            subtitle:
              exposureInfo.type === "phone"
                ? "lower scammer visibility"
                : "public records removed",
          },
          hasOnClick: totalExposuresRemoved > 0,
          day: startDay + 14,
        });
      } else {
        sections.push({
          exposures: 0,
          text: `Around day ${
            startDay + 15
          }, it'll be harder for scammers to use public records to find associates, family members, and your residence when searching your name online.`,
          day: startDay + 14,
        });
      }

      // End-point section
      if (scan.end_point) {
        const exposureInfo = scan.end_point.exposure_info;
        const totalExposuresRemoved = scan.end_point.total_exposures_removed;

        sections.push({
          exposures: -totalExposuresRemoved,
          callout: {
            title: `${exposureInfo.records_removed} copies of your ${exposureInfo.type} were removed`,
            description:
              "Your phone number is just as revealing as your social security number (that's how Cloaked was able to find it!)",
            percent: exposureInfo.statistic,
            subtitle:
              exposureInfo.type === "phone"
                ? "lower scammer visibility"
                : "public records removed",
          },
          day: endDay,
        });
      } else {
        sections.push({
          exposures: 0,
          text: `Around day ${endDay} you'll notice your family members and addresses are less traceable across public records and data brokers.`,
          day: endDay,
        });
      }
    } else {
      sections.push({
        exposures: 0,
        text: `Cloaked is scanning for your data. Check back on ${formattedDate} to see your results.`,
        day: startDay,
      });
    }

    item.sections = sections;
    data.push(item);
  });

  return data;
});

const downloadApp = () => {
  window.open(DOWNLOAD_APP_URL, "_blank");
};

const username = computed(() => store.getters["authentication/getUsername"]);
</script>

<template>
  <div class="timeline-container">
    <p
      v-if="summary.summary.total_exposed_records !== 0"
      class="title"
    >
      Your next
      <span>{{ timelineCardData.length * 30 }}</span>
      days
    </p>
    <p v-if="isMobileDevice">
      To see your full 90 day summary, download the Cloaked app.
    </p>
    <p v-if="isMobileDevice">
      Your account has been set up. Make sure to Sign In using
      <strong>{{ username }}</strong>
      as your username to access your subscription.
    </p>
    <BaseButton
      v-if="isMobileDevice"
      size="lg"
      full-width
      variant="primary"
      icon="download"
      class="timeline-button"
      @click="downloadApp"
    >
      Download Cloaked
    </BaseButton>
    <div class="timeline-section">
      <div
        v-for="(item, index) in timelineCardData"
        :key="index"
      >
        <TimelineButton
          v-if="summary.summary.total_exposed_records !== 0"
          :text="item.button.text"
          :disabled="!item.sections[0]?.exposures"
        />

        <TimelineSection
          v-if="item.sections[0]?.exposures"
          :timelineData="item.sections"
        />
      </div>

      <div
        v-if="summary.summary.total_exposed_records === 0"
        class="loading"
      >
        <InlineSvg name="spinner" />
        <p>Currently retrieving your data...</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.timeline-container {
  background: $color-primary-1;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 16px 20px 0 rgba($black, 0.05);
  width: 100%;
  border: 1px solid $color-primary-10;
  color: $color-primary-100;

  @media all and (min-width: $screen-xl) {
    max-width: 386px;
  }

  p {
    color: $color-primary-70;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    margin-top: 16px;

    &:first-of-type {
      font-size: 18px;
      font-weight: 600;
      line-height: 27px;
      margin-top: 0;
      color: $color-primary-100;

      span {
        text-decoration: underline;
      }
    }
  }

  .timeline-button {
    margin-top: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .timeline-section {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 24px;

    & > div {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;

  p {
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
  }
}
</style>
