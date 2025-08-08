<script setup>
import { computed, ref } from "vue";
import ExposureSummaryProgress from "@/features/homeV3/exposure-summary/ExposureSummaryProgress.vue";
import Button from "@/features/Button.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import router from "@/routes/router";
import { isMobileDevice } from "@/scripts/regex";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";
import store from "@/store";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";
import { PH_FEATURE_FLAG_GOOGLE_SEARCH_REMOVAL } from "@/scripts/posthogEvents.js";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import { HAS_SEEN_GOOGLE_SEARCH_MODAL } from "@/scripts/userFlags.js";
import UserService from "@/api/actions/user-service";
import { posthogCapture } from "@/scripts/posthog.js";

const { featureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_GOOGLE_SEARCH_REMOVAL
);

const props = defineProps({
  summary: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        typeof value.exposures_removed === "number" &&
        (value.latest_scan_date
          ? typeof value.latest_scan_date === "string"
          : true) && //NOTE: sometimes this is missing from API
        typeof value.exposures_found_in_latest_scan === "number" &&
        typeof value.next_scan_date === "string" &&
        typeof value.total_exposed_records === "number"
      );
    },
  },
  timeline: {
    type: Object,
    required: true,
  },
});

const openDataRemovalPage = () => {
  router.push({ name: "DataRemove" });
};

// Compute the progress percentage
const progress = computed(() => {
  if (status.value === "hasRemovals") {
    const totalRemoved = props.summary.exposures_removed || 0;
    const totalRecords = props.summary?.total_exposed_records || 0;
    if (totalRecords === 0) {
      return 0;
    }
    return Math.round((totalRemoved / totalRecords) * 100);
  } else {
    if (hoursSinceStart.value >= 48) {
      return 100;
    }
    return Math.round((hoursSinceStart.value / 48) * 100);
  }
});

function getTimeDiff(date1, date2, unit = "sec") {
  const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
  let millisecondsPerUnit = 1000;
  if (unit === "min") {
    millisecondsPerUnit = millisecondsPerUnit * 60;
  } else if (unit === "hours") {
    millisecondsPerUnit = millisecondsPerUnit * 60 * 60;
  } else if (unit === "days") {
    millisecondsPerUnit = millisecondsPerUnit * 60 * 60 * 24;
  }

  millisecondsPerUnit = Math.abs(millisecondsPerUnit);

  return Math.round(diffInMilliseconds / millisecondsPerUnit);
}

// Compute the number of days until the next scan
const nextScanInDays = computed(() => {
  const nextScanDateStr = props.summary.next_scan_date;
  if (!nextScanDateStr) return null;

  const nextScanDate = new Date(nextScanDateStr);
  const today = new Date();
  const daysDiff = getTimeDiff(nextScanDate, today, "days");
  return daysDiff;
});

// Format the latest scan date
const latestScanDateFormatted = computed(() => {
  const latestScanDateStr = props.summary.latest_scan_date;
  if (!latestScanDateStr) return null;
  const date = new Date(latestScanDateStr);

  return `${date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  })}`;
});

const hoursSinceStart = computed(() => {
  const today = new Date();
  const originalScanDate = new Date(props.timeline.scan_1.scan_date);
  const timeDiffInHours = getTimeDiff(today, originalScanDate, "hours");
  return timeDiffInHours;
});

const countdownFormatted = ref("48 hours");

const status = computed(() => {
  if (props.summary.exposures_removed > 0) {
    return "hasRemovals";
  } else if (hoursSinceStart.value < 48) {
    return "noRemovalsPre48Hours";
  } else {
    return "noRemovalsPost48Hours";
  }
});

const exposureCount = computed(() => {
  switch (status.value) {
    case "hasRemovals":
      return props.summary.exposures_removed;
    default:
      return props.summary.total_exposed_records;
  }
});

const hasSeenGoogleSearchModal = computed(() => {
  return store.getters.getFlag(HAS_SEEN_GOOGLE_SEARCH_MODAL);
});

const showGoogleSearchButton = computed(() => {
  return featureFlag.value === "Test" && !hasSeenGoogleSearchModal.value;
});

function downloadApp() {
  window.open(DOWNLOAD_APP_URL, "_blank");
}

function openGoogleLink() {
  window.open(
    `${HELP_CENTER_BASE_URL}/articles/33486384940564-Removing-Results-About-You-from-Google-Search`,
    "_blank"
  );
  posthogCapture("user_clicked_learn_more_google_search");
}

function openGoogleSearchModal() {
  UserService.setFlag({
    name: HAS_SEEN_GOOGLE_SEARCH_MODAL,
    value: true,
  });

  store.dispatch("openModal", {
    header: "Interested in Google Search Removals by Cloaked?",
    subheader: `Cloaked wants to know if you're interested in having us remove your personal information off of Google search. To indicate your interest in this new feature and access a guide on how to manually remove your data from Google click "Learn more".`,
    button: {
      text: "Learn more",
      onClick: openGoogleLink,
    },
    cancelText: "Not interested",
    triggerCancelActionAfterMainCTA: false,
    cancelAction: () => {
      posthogCapture("user_not_interested_google_search");
    },
  });

  posthogCapture("user_clicked_google_search_button");
}
</script>

<template>
  <div class="exposure-summary">
    <div class="left">
      <ExposureSummaryProgress
        :progress="progress"
        :exposureCount="exposureCount"
        :status="status"
      />
      <div
        v-if="status === 'hasRemovals'"
        class="summary-text"
      >
        <p v-if="nextScanInDays !== null">
          Next Scan in {{ nextScanInDays }} days
        </p>
        <h2 v-if="latestScanDateFormatted !== null">
          Exposures Found on
          <br />
          {{ latestScanDateFormatted }}
        </h2>
      </div>

      <div
        v-else
        class="summary-text"
      >
        <p v-if="status === 'noRemovalsPre48Hours'">
          Expect first results in under {{ countdownFormatted }}
        </p>
        <p v-else>
          Not seeing any results after 48 hours?
          <a href="mailto:support@cloaked.com">
            <u><b>Contact us</b></u>
          </a>
          .
        </p>
        <h2>Removal in progress...</h2>
      </div>
    </div>
    <div class="right">
      <Button
        v-if="!isMobileDevice"
        class="button"
        @click="openDataRemovalPage"
      >
        View removal progress
        <InlineSvg name="chevron-right" />
      </Button>
      <Button
        v-else
        class="button large"
        @click="downloadApp"
      >
        Download Cloaked to view progress
        <InlineSvg name="download" />
      </Button>
      <Button
        v-if="!isMobileDevice && showGoogleSearchButton"
        class="button"
        type="secondary"
        @click="openGoogleSearchModal"
      >
        Want Google Search removals?
        <InlineSvg name="chevron-right" />
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.exposure-summary {
  display: flex;

  @media all and (min-width: $screen-xl) {
    background: $color-primary-1;
    gap: 20px;
    align-items: center;
    border-radius: 24px;
    box-shadow: 0 8px 20px 0 rgba($black, 0.05);
    padding: 24px 36px;
    width: 100%;
    max-width: 788px;
    border: 1px solid $color-primary-10;
    flex-direction: row;
  }
  @media all and (max-width: $screen-xl) {
    flex-flow: column wrap;
    .right {
      margin: 0 auto;
      padding-top: 24px;
    }
  }

  .summary-text {
    width: 100%;
    text-align: center;

    @media all and (min-width: $screen-xl) {
      text-align: left;
      width: auto;
    }

    p {
      font-size: 12px;
      font-weight: 600;
      line-height: 18px;
      color: $color-primary-100;
      margin-bottom: 8px;
    }

    h2 {
      font-size: 24px;
      font-weight: 600;
      line-height: 36px;
      color: $color-primary-100;
    }
  }

  .left {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    flex-wrap: wrap;
    gap: 24px;
    width: 100%;

    @media all and (min-width: $screen-xl) {
      justify-content: flex-start;
    }
  }
  .right {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    max-width: 230px;
    .button {
      font-weight: 600;
      width: 100%;
      &.large {
        min-width: 260px;
      }
    }
  }
}
</style>
