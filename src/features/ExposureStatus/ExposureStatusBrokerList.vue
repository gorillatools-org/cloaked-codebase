<script setup>
import { ref, computed, provide } from "vue";
import store from "@/store";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import ExposureStatusBrokerListSection from "@/features/ExposureStatus/ExposureStatusBrokerListSection.vue";

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

const pastScans = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.pastScans ?? [];
});

const brokerList = computed(() => {
  return store.getters["dataDelete/removalLogData"]?.brokerList ?? [];
});

// Helper function to get unique brokers by state
const getUniqueBrokersByState = (state) => {
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
  const uniqueBrokers = new Map();

  brokerList.value
    .filter(
      (broker) =>
        broker.state === "removal_in_progress" &&
        broker.records &&
        broker.records.find((record) => record.is_removed !== true)
    )
    .forEach((broker) => {
      if (!uniqueBrokers.has(broker.broker_name)) {
        uniqueBrokers.set(broker.broker_name, broker);
      }
    });

  return Array.from(uniqueBrokers.values());
});

const removingBrokers = computed(() => {
  const uniqueBrokers = new Map();

  brokerList.value
    .filter(
      (broker) =>
        broker.state === "removal_in_progress" &&
        broker.records &&
        broker.records.find((record) => record.is_removed === true)
    )
    .forEach((broker) => {
      if (!uniqueBrokers.has(broker.broker_name)) {
        uniqueBrokers.set(broker.broker_name, broker);
      }
    });

  return Array.from(uniqueBrokers.values());
});

const formatScanDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const closeAllItems = () => {
  openItemIds.value.clear();
};
</script>

<template>
  <div class="page-exposure-status__broker-list">
    <div class="page-exposure-status__broker-list-header">
      <BaseIcon
        name="data-broker"
        class="page-exposure-status__broker-list-header-icon"
      />
      <div
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
      </div>
      <BaseText
        variant="headline-3-bold"
        as="h3"
        class="page-exposure-status__broker-list-header-title"
      >
        Data Brokers
      </BaseText>
    </div>

    <div class="page-exposure-status__broker-list-table">
      <ExposureStatusBrokerListSection
        v-if="removingBrokers.length > 0"
        title="Removing"
        :brokers="removingBrokers"
        @closeAllItems="closeAllItems"
      />

      <ExposureStatusBrokerListSection
        v-if="scanningBrokers.length > 0"
        title="Scanning"
        :brokers="scanningBrokers"
        :amountDisplayed="enrollmentData.totalRecordsRemoved === 0 ? 10 : 3"
        @closeAllItems="closeAllItems"
      />

      <ExposureStatusBrokerListSection
        v-if="monitoredBrokers.length > 0"
        title="Monitoring"
        :brokers="monitoredBrokers"
        :amountDisplayed="
          removingBrokers.length === 0 && scanningBrokers.length === 0 ? 10 : 3
        "
        @closeAllItems="closeAllItems"
      />

      <ExposureStatusBrokerListSection
        v-if="actionRequiredBrokers.length > 0 && false"
        title="Action Required"
        :brokers="actionRequiredBrokers"
        @closeAllItems="closeAllItems"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-exposure-status__broker-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  &-table {
    position: relative;
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
  width: 100%;
}

.page-exposure-status__broker-list-section {
  margin-bottom: 24px;
}
</style>
