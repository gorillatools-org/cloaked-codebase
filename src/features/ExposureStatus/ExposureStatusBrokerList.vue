<script setup>
import { ref, computed, provide, onBeforeMount, markRaw } from "vue";
import store from "@/store";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import ExposureStatusBrokerListSection from "@/features/ExposureStatus/ExposureStatusBrokerListSection.vue";
import { useRelativesApi } from "@/composables/useRelativesApi.js";
import ShareFeedbackModal from "@/features/feedback/ShareFeedbackModal.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import ExposureStatusLoading from "@/features/ExposureStatus/ExposureStatusLoading.vue";

const openItemIds = ref(new Set());

// Add item to open items set
const openItem = (itemId) => {
  openItemIds.value.add(itemId);
};

// Remove item from open items set
const closeItem = (itemId) => {
  openItemIds.value.delete(itemId);
};

const enrollmentData = computed(() => {
  return store.getters["dataDelete/enrollmentData"] || {};
});

// Provide open items state to child components
provide("openItemIds", openItemIds);
provide("openItem", openItem);
provide("closeItem", closeItem);

// NOTE: Currently not shown
// const pastScans = computed(() => {
//   return store.getters["dataDelete/enrollmentData"]?.pastScans ?? [];
// });

const brokerList = computed(() => {
  return store.getters["dataDelete/removalLogData"]?.brokerList;
});

// Helper function to get unique brokers by state
const getUniqueBrokersByState = (state) => {
  if (!Array.isArray(brokerList.value) || brokerList.value.length === 0) {
    return [];
  }

  const uniqueBrokers = new Map();
  brokerList.value
    .filter((broker) => broker.state === state)
    .forEach((broker) => {
      if (!uniqueBrokers.has(broker.broker_name)) {
        uniqueBrokers.set(broker.broker_name, broker);
      }
    });
  return Array.from(uniqueBrokers.values());
};

const monitoredBrokers = computed(() => {
  if (!Array.isArray(brokerList.value) || brokerList.value.length === 0) {
    return [];
  }

  // Get all brokers with "removed" and "no_records_found" states
  // "removed" brokers will appear first, then "no_records_found" brokers
  const uniqueBrokers = new Map();

  // First add all "removed" brokers
  brokerList.value
    .filter((broker) => broker.state === "removed")
    .forEach((broker) => {
      if (!uniqueBrokers.has(broker.broker_name)) {
        uniqueBrokers.set(broker.broker_name, broker);
      }
    });

  // Then add all "no_records_found" brokers that aren't already included
  brokerList.value
    .filter((broker) => broker.state === "no_records_found")
    .forEach((broker) => {
      if (!uniqueBrokers.has(broker.broker_name)) {
        uniqueBrokers.set(broker.broker_name, broker);
      }
    });

  return Array.from(uniqueBrokers.values());
});

const actionRequiredBrokers = computed(() => {
  return getUniqueBrokersByState("action_required");
});

const scanningBrokers = computed(() => {
  if (!Array.isArray(brokerList.value) || brokerList.value.length === 0) {
    return [];
  }

  const uniqueBrokers = new Map();

  brokerList.value
    .filter((broker) => broker.state === "scanning")
    .forEach((broker) => {
      if (!uniqueBrokers.has(broker.broker_name)) {
        uniqueBrokers.set(broker.broker_name, broker);
      }
    });

  return Array.from(uniqueBrokers.values());
});

const removingBrokers = computed(() => {
  if (!Array.isArray(brokerList.value) || brokerList.value.length === 0) {
    return [];
  }

  const uniqueBrokers = new Map();

  brokerList.value
    .filter((broker) => broker.state === "removal_in_progress")
    .forEach((broker) => {
      if (!uniqueBrokers.has(broker.broker_name)) {
        uniqueBrokers.set(broker.broker_name, broker);
      }
    });

  return Array.from(uniqueBrokers.values());
});

// NOTE: Currently not shown
// const formatScanDate = (date) => {
//   return new Date(date).toLocaleDateString("en-US", {
//     month: "long",
//     day: "numeric",
//     year: "numeric",
//   });
// };

const closeAllItems = () => {
  openItemIds.value.clear();
};

function openReportIssueModal() {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(ShareFeedbackModal),
      props: {
        show: true,
        isReportMode: true,
        source: "Exposure Status",
        defaultCategory: "Identity Monitoring",
      },
      events: {
        close: () => {
          store.dispatch("closeModal");
        },
      },
    },
  });
}

const { fetchRelatives } = useRelativesApi();
onBeforeMount(fetchRelatives);

const {
  hasLoadedFeatureFlag: hasLoadedActionRequiredRemovalsOnFlag,
  featureFlag: actionRequiredRemovalsOn,
} = usePostHogFeatureFlag("action-required-removals-on");

const shouldShowActionRequired = computed(() => {
  return (
    hasLoadedActionRequiredRemovalsOnFlag.value &&
    actionRequiredRemovalsOn.value
  );
});
</script>

<template>
  <div class="page-exposure-status__broker-list">
    <div class="page-exposure-status__broker-list-header">
      <BaseIcon
        name="data-broker"
        class="page-exposure-status__broker-list-header-icon"
      />
      <!-- <div
        v-if="pastScans.length > 0 && false"
        class="page-exposure-status__broker-list-select"
      >
        <select>
          <option
            v-for="(pastScan, index) in pastScans"
            :key="`${pastScan.id}-${pastScan.date}`"
          >
            {{ index === 0 ? "Current Scan" : formatScanDate(pastScan.date) }}
          </option>
        </select>
      </div> -->
      <div class="page-exposure-status__broker-list-header-wrapper">
        <BaseText
          variant="headline-3-bold"
          as="h3"
          class="page-exposure-status__broker-list-header-title"
        >
          Data Brokers
        </BaseText>
        <BaseText
          variant="body-3-semibold"
          class="page-exposure-status__broker-list-header-report-issue"
          @click="openReportIssueModal"
        >
          Report an Issue
        </BaseText>
      </div>
    </div>

    <div class="page-exposure-status__broker-list-table">
      <ExposureStatusLoading v-if="brokerList.length === 0" />
      <ExposureStatusBrokerListSection
        v-if="removingBrokers.length > 0"
        title="Removing"
        :brokers="removingBrokers"
        @close-all-items="closeAllItems"
      />

      <ExposureStatusBrokerListSection
        v-if="scanningBrokers.length > 0"
        title="Securing"
        :brokers="scanningBrokers"
        :amount-displayed="enrollmentData.totalRecordsRemoved === 0 ? 10 : 3"
        @close-all-items="closeAllItems"
      />

      <ExposureStatusBrokerListSection
        v-if="monitoredBrokers.length > 0"
        title="Monitoring"
        :brokers="monitoredBrokers"
        :amount-displayed="
          removingBrokers.length === 0 && scanningBrokers.length === 0 ? 10 : 3
        "
        @close-all-items="closeAllItems"
      />

      <ExposureStatusBrokerListSection
        v-if="actionRequiredBrokers.length > 0 && shouldShowActionRequired"
        title="Action Required"
        :brokers="actionRequiredBrokers"
        @close-all-items="closeAllItems"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.page-exposure-status__broker-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  &-table {
    position: relative;
    padding-bottom: 24px;
  }
}

.page-exposure-status__broker-list-header {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin-top: 24px;
}

.page-exposure-status__broker-list-header-icon {
  display: block;
  width: 24px;
  height: 24px;
  font-size: 24px;
  font-weight: 500;
}

.page-exposure-status__broker-list-header-title {
  margin-top: 16px;
}

.page-exposure-status__broker-list-header-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
}

.page-exposure-status__broker-list-section {
  margin-bottom: 24px;
}
.page-exposure-status__broker-list-header-report-issue {
  color: $color-primary-70;
  text-decoration: underline;
  padding: 5px 24px;
  cursor: pointer;

  &:hover {
    color: $color-primary-100;
  }
}
</style>
