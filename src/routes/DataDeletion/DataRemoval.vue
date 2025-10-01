<script setup>
import { onMounted, computed, watch, nextTick, ref } from "vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import InlineSvg from "@/features/InlineSvg.vue";
import DataRemovalGraphSummarySection from "@/routes/DataDeletion/components/DataRemovalGraphSummarySection.vue";
import DataRemovalRequestsSection from "@/routes/DataDeletion/components/DataRemovalRequestsSection.vue";
import DataRemovalSkeletonLoader from "@/routes/DataDeletion/components/DataRemovalSkeletonLoader.vue";
import store from "@/store";
import DataRemovalFaqSection from "@/routes/DataDeletion/components/DataRemovalFaqSection.vue";
import DataRemovalActionBanner from "@/routes/DataDeletion/components/DataRemovalActionBanner.vue";
import moment from "moment";
import router from "@/routes/router";
import { useDataDeleteOperator } from "@/routes/DataDeletion/composables/useDataDeleteOperator";

import {
  DATA_REMOVAL_STATUS_DISPLAY,
  DATA_REMOVAL_STATUS,
} from "@/scripts/constants";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import BaseText from "@/library/BaseText.vue";

onMounted(async () => {
  DataDeleteService.getRemovalLog().catch(() => {});
  DataDeleteService.getEnrollmentData().catch(() => {});
  DataDeleteService.getGraphData()
    .then((response) => {
      rawGraphData.value = response?.data;
      if (!response?.data?.graph_data || !response?.data?.graph_data?.length) {
        hideGraph.value = true;
      }
    })
    .catch(() => {
      // only hide graph if no data is saved AND no data was returned
      // this way if second api call failed but first one succeeded, user can still see graph data
      if (rawGraphData.value === null) {
        hideGraph.value = true;
      }
    });
});

const selectedScan = ref(null);
const selectedStatus = ref(null);
const loadingScanData = ref(false);
const fetchingInitialData = ref(true);

const hideGraph = ref(false);

const rawGraphData = ref(store.getters["dataDelete/getGraphData"] || {});

const selectedStatusDisplay = computed(() => {
  if (selectedStatus.value) {
    return DATA_REMOVAL_STATUS_DISPLAY[selectedStatus.value];
  }
  return "All brokers";
});

const brokerList = computed(() => {
  if (selectedScan.value?.id === latestScan.value?.id) {
    return store.getters["dataDelete/removalLogData"]?.brokerList ?? [];
  }
  return store.getters["dataDelete/removalLogDataPastScan"]?.brokerList ?? [];
});

const removalLogFetched = computed(() => {
  return store.getters["dataDelete/removalLogData"]?.removalLogFetched;
});

const enrollmentDataFetched = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.enrollmentDataFetched;
});

const actionRequiredFamilies = computed(() => {
  if (selectedScan.value?.id !== latestScan.value?.id) {
    return []; // if previous scan, action items will show as in progress
  }
  if (
    selectedStatus.value &&
    selectedStatus.value !== DATA_REMOVAL_STATUS.ACTION_REQUIRED
  ) {
    return [];
  }

  return (
    store.getters["dataDelete/actionRequiredFamilies"]?.sort(
      (a, b) => a.name - b.name
    ) ?? []
  );
});

const brokerListMap = computed(() => {
  return new Map(
    brokerList.value.map((broker) => [broker.broker_name, broker])
  );
});

const actionRequiredBrokersGroupedByFamily = computed(() => {
  // This is necessary since actionRequiredFamilies does not contain full broker objects, only IDs
  // Slightly redundant with actionRequiredItems but they're used separately.
  const groupedBrokers = {};

  actionRequiredFamilies.value.forEach((family) => {
    family.brokers.forEach((broker) => {
      const brokerInList = brokerListMap.value.get(broker.name);
      if (brokerInList) {
        if (!groupedBrokers[family.name]) {
          groupedBrokers[family.name] = [];
        }
        groupedBrokers[family.name].push(brokerInList);
      }
    });
  });

  return groupedBrokers;
});

const actionRequiredItems = computed(() => {
  return brokerList.value.filter(
    (broker) => broker.state === "action_required"
  );
});

const filteredBrokers = computed(() => {
  // First filter out manual removal brokers
  const manualRemovalBrokerNames = new Set();
  actionRequiredFamilies.value.forEach((family) => {
    family.brokers?.forEach((broker) => {
      manualRemovalBrokerNames.add(broker.name);
    });
  });

  let filteredList = [...brokerList.value].filter(
    (broker) => !manualRemovalBrokerNames.has(broker.broker_name)
  );

  if (selectedStatus.value) {
    filteredList = filteredList.filter(
      (broker) => broker.state === selectedStatus.value
    );
  }

  // Polyfill for Object.groupBy
  if (!Object.groupBy) {
    Object.groupBy = function (items, keySelector) {
      return items.reduce((acc, item, index) => {
        const key = keySelector(item, index);
        acc[key] = acc[key] || [];
        acc[key].push(item);
        return acc;
      }, {});
    };
  }

  const groupedBrokers = Object.groupBy(filteredList, (broker) => broker.state);
  const fullList = [];

  if (groupedBrokers[DATA_REMOVAL_STATUS.REMOVED]) {
    fullList.push(
      ...groupedBrokers[DATA_REMOVAL_STATUS.REMOVED].sort(
        (a, b) => a.broker_name - b.broker_name
      )
    );
  }
  if (groupedBrokers[DATA_REMOVAL_STATUS.REMOVAL_IN_PROGRESS]) {
    fullList.push(
      ...groupedBrokers[DATA_REMOVAL_STATUS.REMOVAL_IN_PROGRESS].sort(
        (a, b) => a.broker_name - b.broker_name
      )
    );
  }
  if (groupedBrokers[DATA_REMOVAL_STATUS.CONTINUED]) {
    fullList.push(
      ...groupedBrokers[DATA_REMOVAL_STATUS.CONTINUED].sort(
        (a, b) => a.broker_name - b.broker_name
      )
    );
  }
  if (groupedBrokers[DATA_REMOVAL_STATUS.SCANNING]) {
    fullList.push(
      ...groupedBrokers[DATA_REMOVAL_STATUS.SCANNING].sort(
        (a, b) => a.broker_name - b.broker_name
      )
    );
  }
  if (groupedBrokers[DATA_REMOVAL_STATUS.NO_RECORDS_FOUND]) {
    fullList.push(
      ...groupedBrokers[DATA_REMOVAL_STATUS.NO_RECORDS_FOUND].sort(
        (a, b) => a.broker_name - b.broker_name
      )
    );
  }

  return fullList;
});

const pastScans = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.pastScans ?? [];
});
const latestScan = computed(() => {
  return store.getters["dataDelete/enrollmentData"]?.latestScan;
});

function fetchActionsRequired() {
  DataDeleteService.getActionItems().catch(() => {});
}

function navToDDSettings() {
  router.push({ name: "settings.dataRemoval" });
}

function resetFilters() {
  selectedStatus.value = null;
  selectedScan.value = latestScan.value;
}

function formatScanDate(date) {
  return moment(date).format("MMMM D, YYYY");
}

const unwatchActionsRequired = watch(
  () => removalLogFetched?.value && actionRequiredItems?.value?.length,
  (needToFetchFamilies) => {
    if (
      needToFetchFamilies &&
      actionRequiredItems?.value?.length !==
        actionRequiredFamilies?.value?.length
    ) {
      fetchActionsRequired();
      nextTick(() => unwatchActionsRequired());
    }
  },
  { immediate: true }
);

const unwatchLatestScan = watch(
  () => latestScan.value,
  (newValue, oldValue) => {
    if (newValue && !oldValue) {
      selectedScan.value = latestScan.value;
      nextTick(() => unwatchLatestScan());
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => selectedScan.value?.id,
  (newScanId, oldScanId) => {
    if (newScanId && newScanId !== oldScanId) {
      loadingScanData.value = true;
      DataDeleteService.getPastScan(newScanId)
        .then(() => {
          loadingScanData.value = false;
        })
        .catch(() => {
          loadingScanData.value = false;
        });
    }
  },
  { deep: true, immediate: true }
);

const unwatchInitialDataLoaded = watch(
  () =>
    !!removalLogFetched?.value &&
    (actionRequiredItems?.value?.length
      ? !!actionRequiredFamilies?.value?.length
      : true),
  (newVal) => {
    if (newVal) {
      fetchingInitialData.value = false;
      nextTick(() => unwatchInitialDataLoaded());
    }
  },
  { immediate: true, deep: true }
);

const { operatorEnabled } = useDataDeleteOperator();
</script>

<template>
  <div class="page-wrapper">
    <div class="section-wrapper border">
      <h1 class="title">
        <BaseText variant="headline-3-bold">Removal Results</BaseText>
        <span
          class="subtitle"
          @click="navToDDSettings"
        >
          <InlineSvg
            name="cog"
            class="icon"
          />
          <BaseText variant="body-2-semibold">Settings</BaseText>
        </span>
      </h1>

      <DataRemovalSkeletonLoader v-if="!rawGraphData && !hideGraph" />
      <DataRemovalGraphSummarySection
        v-else-if="!hideGraph"
        :raw-graph-data="rawGraphData"
        :enrollment-data-fetched="enrollmentDataFetched"
      />
      <DataRemovalActionBanner
        v-if="operatorEnabled && actionRequiredFamilies.length"
        :action-required-families="actionRequiredFamilies"
      />
      <h1 class="title large-margin">
        <BaseText
          as="div"
          variant="headline-3-bold"
        >
          Brokers
        </BaseText>
        <div class="submenu">
          <BaseText
            as="div"
            variant="body-small-medium"
            underline
            @click="resetFilters"
          >
            Reset Filters
          </BaseText>
          <UiMenu
            width="182px"
            placement="bottom-end"
            :offset-away="8"
            class="dropdown-menu"
          >
            <div class="menu-selector">
              <BaseText
                as="div"
                variant="body-small-medium"
              >
                {{
                  selectedScan?.date
                    ? formatScanDate(selectedScan?.date)
                    : "Current scan"
                }}
              </BaseText>
              <InlineSvg name="chevron-down" />
            </div>
            <template #content>
              <UiMenuButton
                title="Current scan"
                @click="selectedScan = latestScan"
              >
                <template #icon>
                  <InlineSvg
                    v-if="selectedScan?.id === latestScan?.id"
                    name="check"
                  />
                </template>
              </UiMenuButton>
              <UiMenuButton
                v-for="scan in pastScans"
                :key="`${scan.id}-${scan.date}`"
                :title="formatScanDate(scan.date)"
                @click="selectedScan = scan"
              >
                <template #icon>
                  <InlineSvg
                    v-if="selectedScan?.id === scan?.id"
                    name="check"
                  />
                </template>
              </UiMenuButton>
            </template>
          </UiMenu>

          <UiMenu
            width="200px"
            placement="bottom-end"
            :offset-away="8"
            class="dropdown-menu"
          >
            <div class="menu-selector">
              <BaseText
                as="div"
                variant="body-small-medium"
              >
                {{ selectedStatusDisplay }}
              </BaseText>
              <InlineSvg name="chevron-down" />
            </div>
            <template #content>
              <UiMenuButton
                title="All brokers"
                @click="selectedStatus = null"
              >
                <template #icon>
                  <InlineSvg
                    v-if="!selectedStatus"
                    name="check"
                  />
                </template>
              </UiMenuButton>
              <UiMenuButton
                v-for="removalStatus in Object.keys(
                  DATA_REMOVAL_STATUS_DISPLAY
                )"
                :key="`${removalStatus}-key`"
                :title="DATA_REMOVAL_STATUS_DISPLAY[removalStatus]"
                @click="selectedStatus = removalStatus"
              >
                <template #icon>
                  <InlineSvg
                    v-if="selectedStatus === removalStatus"
                    name="check"
                  />
                </template>
              </UiMenuButton>
            </template>
          </UiMenu>
        </div>
      </h1>
      <DataRemovalSkeletonLoader v-if="fetchingInitialData" />
      <DataRemovalRequestsSection
        v-else-if="filteredBrokers.length || actionRequiredFamilies.length"
        :requests="filteredBrokers"
        :action-required-families="actionRequiredFamilies"
        :action-required-brokers-grouped-by-family="
          actionRequiredBrokersGroupedByFamily
        "
        :loading="loadingScanData"
      />

      <BaseText
        v-else
        as="div"
        variant="headline-6-medium"
        class="empty-list"
      >
        There are no brokers with status of "{{
          selectedStatusDisplay.toLowerCase()
        }}" for this period.
      </BaseText>
    </div>

    <div class="section-wrapper">
      <BaseText
        variant="headline-3-bold"
        as="h1"
        class="title"
      >
        FAQ
      </BaseText>
      <DataRemovalFaqSection />
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.page-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  padding: 40px 80px;
  @media (max-width: 1024px) {
    padding: 40px 40px;
  }

  .section-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;

    &.border {
      padding: 24px;
      border-radius: 12px;
      border: 1px solid $color-primary-10;
    }
  }
}
.title {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  @media (max-width: 610px) {
    flex-direction: column;
    align-items: flex-start;
  }

  &.large-margin {
    margin-top: 38px;
  }

  .icon {
    svg {
      height: 15px;
      width: auto;
    }
  }
  .submenu {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    @media (max-width: 410px) {
      flex-direction: column;
      align-items: flex-start;
      .dropdown-menu {
        width: 100%;
      }
    }
    .dropdown-menu {
      cursor: pointer;
    }
    .menu-selector {
      border-radius: 4px;
      border: 1px solid $color-primary-50;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 4px 16px;
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      &:hover {
        transform: scale(1.02);
        transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      }
    }
  }
}

.subtitle {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  cursor: pointer;

  svg {
    width: 17px;
    height: auto;
  }
  &:hover {
    cursor: pointer;
  }
}

.empty-list {
  padding: 80px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
