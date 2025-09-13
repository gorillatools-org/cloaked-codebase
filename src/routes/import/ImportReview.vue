<script setup>
import Tabs from "@/features/ui/Tabs";
import ReviewTable from "@/features/import/ReviewTable";
import InfiniteLoader from "@/features/global/InfiniteLoader";
import {
  LABEL_STATUS,
  STATUSES_READY,
  STATUSES_DUPLICATE,
  STATUSES_MISSING_INFO,
  FIELD_NICKNAME,
  STATUS_FIRST_DUPLICATE,
  STATUS_DUPLICATE,
} from "@/store/modules/accounts-importer/shared.js";
import { getPrimaryStatus } from "@/store/modules/accounts-importer/index.js";
import { computed, onBeforeMount, reactive, watch } from "vue";
import store from "@/store";

const props = defineProps({
  pageLimit: {
    type: Number,
    default: 30,
  },
});
const state = reactive({
  activeTab: 0,
  displayedIdentities: props?.pageLimit,
  sorting: [],
});

const tabs = computed(() => {
  const STATUSES_ALL = [
    ...STATUSES_READY,
    ...STATUSES_DUPLICATE,
    ...STATUSES_MISSING_INFO,
  ];

  return [
    {
      label: "All",
      items:
        store.getters["accountsImporter/getIdentities"](STATUSES_ALL).length,
      statuses: STATUSES_ALL,
    },
    {
      label: "Needs review",
      items: store.getters["accountsImporter/getIdentities"](
        STATUSES_MISSING_INFO,
        null,
        [STATUS_DUPLICATE]
      ).length,
      statuses: STATUSES_MISSING_INFO,
      excludeStatuses: [STATUS_DUPLICATE],
    },
    {
      label: "Duplicates",
      items:
        store.getters["accountsImporter/getIdentities"](STATUSES_DUPLICATE)
          .length,
      statuses: STATUSES_DUPLICATE,
    },
    {
      label: "No issue",
      items: store.getters["accountsImporter/getIdentities"](
        STATUSES_READY,
        null,
        [STATUS_DUPLICATE]
      ).length,
      statuses: STATUSES_READY,
      excludeStatuses: [STATUS_DUPLICATE],
    },
  ];
});
const statuses = computed(() => tabs.value[state.activeTab].statuses);
const excludeStatuses = computed(
  () => tabs.value[state.activeTab].excludeStatuses || []
);
const sortingFunction = computed(() => {
  if (state.sorting[0]) {
    const columnIndex = store.getters["accountsImporter/getIdentityFieldIndex"](
      state.sorting[0]
    );
    const isStatus = state.sorting[0] === LABEL_STATUS;

    return (a, b) => {
      const valueA = isStatus
        ? getPrimaryStatus(a.statuses)
        : a.record[columnIndex];
      const valueB = isStatus
        ? getPrimaryStatus(b.statuses)
        : b.record[columnIndex];

      if (state.sorting[1] === "desc") {
        if (valueA < valueB) {
          return 1;
        }

        if (valueA > valueB) {
          return -1;
        }

        return 0;
      } else {
        if (valueA < valueB) {
          return -1;
        }

        if (valueA > valueB) {
          return 1;
        }

        return 0;
      }
    };
  }

  if (state.activeTab === 3) {
    const nameColumnIndex =
      store.getters["accountsImporter/getIdentityFieldIndex"](FIELD_NICKNAME);

    return (a, b) => {
      if (a.record[nameColumnIndex] > b.record[nameColumnIndex]) {
        return 1;
      }

      if (b.record[nameColumnIndex] > a.record[nameColumnIndex]) {
        return -1;
      }

      if (a.statuses[0] === STATUS_FIRST_DUPLICATE) {
        return -1;
      }

      if (b.statuses[0] === STATUS_FIRST_DUPLICATE) {
        return 1;
      }

      return 0;
    };
  }

  return null;
});
const identities = computed(() => {
  return store.getters["accountsImporter/getIdentities"](
    statuses.value,
    sortingFunction.value,
    excludeStatuses.value
  ).slice(0, state.displayedIdentities);
});
const hasMoreIdentities = computed(() => {
  return (
    store.getters["accountsImporter/getIdentities"](
      statuses.value,
      null,
      excludeStatuses.value
    ).length > state.displayedIdentities
  );
});

watch(
  () => props.pageLimit,
  (value) => {
    state.displayedIdentities = value;
  },
  { deep: true }
);
watch(
  [() => state.sorting, statuses],
  () => {
    state.displayedIdentities = props.pageLimit;
  },
  { deep: true }
);

function loadMoreIdentities() {
  if (hasMoreIdentities.value) {
    state.displayedIdentities = state.displayedIdentities + props.pageLimit;
  }
}

onBeforeMount(() => {
  store.dispatch("accountsImporter/prepareIdentities");
});
</script>

<template>
  <div class="import-review">
    <router-view />
    <h1 class="import__step-title">Review & import identities</h1>
    <div class="import-review__navigation">
      <Tabs
        :value="state.activeTab"
        :tabs="tabs"
        class="import-review__tabs"
        @input="(event) => (state.activeTab = event)"
      >
        <template #default="{ tab }">
          <span class="import-review__tab-label">
            {{ tab.label }}
          </span>
          <span class="import-review__tab-items">
            {{ tab.items }}
          </span>
        </template>
      </Tabs>
    </div>
    <template v-if="identities.length > 0">
      <ReviewTable
        :statuses="statuses"
        :exclude-statuses="excludeStatuses"
        :identities="identities"
        :value="state.sorting"
        @input="(event) => (state.sorting = event)"
      >
        <template #footer>
          <InfiniteLoader
            v-if="hasMoreIdentities"
            :all-data-fetched="!hasMoreIdentities"
            class="import-mapping__infinite-loader"
            @load-more="loadMoreIdentities"
          />
        </template>
      </ReviewTable>
    </template>
    <p
      v-else
      class="import-review__no-identities"
    >
      No identities found
    </p>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.import-review {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__navigation {
    margin-top: 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-50;
    border-bottom: 1px solid $border-white;
  }

  &__help {
    &-button {
      color: #6251f8;
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    &-icon {
      margin-left: 4px;
    }
  }

  & &__tab-items {
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-50;
    margin-left: 4px;

    @at-root .tabs__item:hover .import-review__tab-items {
      opacity: 0.5;
    }

    @at-root .tabs__item--active .import-review__tab-items {
      color: $color-primary-50;
    }

    @at-root .tabs__item--active:hover .import-review__tab-items {
      color: $color-primary-50;
      opacity: 1;
    }
  }

  &__infinite-loader {
    display: flex;
    justify-content: center;
  }

  &__no-identities {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-50;
  }
}
</style>
