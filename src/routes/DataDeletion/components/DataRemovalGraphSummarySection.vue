<script setup>
import { computed } from "vue";

import InlineSvg from "@/features/InlineSvg.vue";
import DataRemovalGraphShared from "@/routes/DataDeletion/components/RequestGraph/DataRemovalGraphShared.vue";
import store from "@/store";
import { MONTHS } from "@/scripts/constants";
import { format } from "@/scripts/format";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

const props = defineProps({
  rawGraphData: {
    type: Object,
    required: true,
  },
  enrollmentDataFetched: {
    type: Boolean,
    required: true,
  },
});

const nextScanDate = computed(() => {
  const nextScanDateTime =
    store.getters["dataDelete/enrollmentData"]?.nextScanDate;
  if (nextScanDateTime) {
    const nextScan = new Date(nextScanDateTime);
    return `${MONTHS[nextScan.getMonth()].slice(0, 3)} ${nextScan.getDate()}`;
  }

  return null;
});

const totalItemsRemoved = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.totalItemsRemoved ?? 0;
});

const totalItemsRemovedToday = computed(() => {
  return (
    store.getters["dataDelete/enrollmentData"]?.totalItemsRemovedToday ?? 0
  );
});

function openRecordsRemovedModal() {
  store.dispatch("openModal", {
    header: "Records Removed",
    paragraphs: [
      "A record can be your name, email address(es), phone number(s), address(es), or a relative(s). We submit requests to have this data removed on your behalf. Some data brokers may have more than one profile on you with multiple records within each.",
      "Cloaked calculates your individual pieces of information found on a data broker to display your Records Removed number.",
    ],
    showCancel: false,
    button: {
      text: "Close",
      onClick: () => store.dispatch("closeModal"),
    },
  });
}

function openNextScanModal() {
  store.dispatch("openModal", {
    header: "Next scan",
    paragraphs: [
      "Cloaked continually monitors your data across 129 data brokers and automatically submits requests to remove them on your behalf.",
      "This process is ongoing and restarts every 30 days.",
    ],
    showCancel: false,
    button: {
      text: "Close",
      onClick: () => store.dispatch("closeModal"),
    },
  });
}

const { isMobile } = useDisplay();
</script>

<template>
  <div
    v-show="props.enrollmentDataFetched"
    class="box-wrapper"
  >
    <div class="data-summary">
      <div class="data-removal-graph-data-container">
        <div class="total-records-number-container">
          <BaseText
            :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
            class="total-number"
          >
            {{ format.formatNumbersBasedonLocale(totalItemsRemoved) }}
          </BaseText>
          <BaseText
            v-if="totalItemsRemovedToday > 0"
            variant="body-3-semibold"
            class="total-number-changed"
          >
            +{{ format.formatNumbersBasedonLocale(totalItemsRemovedToday) }}
            Today
          </BaseText>
        </div>
        <div class="data-removal-graph-data-label-container">
          <BaseText
            variant="body-small-medium"
            class="data-removal-graph-data-label"
          >
            Records removed
          </BaseText>
          <InlineSvg
            name="question-mark-circle"
            class="text-link"
            @click="openRecordsRemovedModal"
          />
        </div>
      </div>
      <div
        v-if="nextScanDate"
        class="data-removal-graph-data-container"
      >
        <BaseText
          :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
        >
          {{ nextScanDate }}
        </BaseText>
        <div class="data-removal-graph-data-label-container">
          <BaseText
            variant="body-small-medium"
            class="data-removal-graph-data-label"
          >
            Next Scan
          </BaseText>
          <InlineSvg
            name="question-mark-circle"
            class="text-link"
            @click="openNextScanModal"
          />
        </div>
      </div>
    </div>
    <DataRemovalGraphShared :raw-graph-data="props.rawGraphData" />
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.box-wrapper {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  color: $color-primary-100;
  margin-top: 16px;
  width: 100%;
}

.data-summary {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
}

.data-removal-graph-data-container {
  display: flex;
  flex: 50%;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  @media (max-width: 768px) {
    align-items: center;
  }
}

.total-records-number-container {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: top;
  gap: 8px;
}

.total-number {
  color: $color-success;
}

.total-number-changed {
  color: $color-primary-1;
  background-color: $color-success;
  border-radius: 49px;
  padding: 2px 6px;
  text-align: center;
}

.data-removal-graph-data-label-container {
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  svg {
    filter: brightness(95%);
    cursor: pointer;

    &:hover {
      box-shadow: 0px 5px 5px 0px rgba($color-primary-100-light, 0.1);
      @at-root .theme-dark & {
        box-shadow: 0px 5px 5px 0px rgba($color-primary-100-dark, 0.1);
      }
      filter: brightness(100%);
      transform: scale(1.1) translate3d(0, 0, 0);
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    }
  }
}

.data-removal-graph-data-label {
  color: $color-primary-70;
}
</style>
