<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import DataDeleteScanResultsTableRow from "@/features/data-delete/DataDeleteScanResultsTableRow.vue";
import { posthogCapture } from "@/scripts/posthog";
import { PH_EVENT_USER_CLICKED_DATA_DELETION_SEARCH_RESULTS_CONTINUE_BUTTON } from "@/scripts/posthogEvents";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
  searchResults: {
    type: Array,
    default: () => [],
  },
  isForcingNewSearch: {
    type: Boolean,
    default: false,
  },
});

const isExpanded = ref(false);

const emit = defineEmits(["setup", "force-new-search"]);
const bestMatch = computed(() => props.searchResults[0] ?? null);

const onDelete = () => {
  emit("setup");

  sessionStorage.setItem(
    "data-delete",
    JSON.stringify({ ...bestMatch.value, searchDate: new Date() })
  );
  posthogCapture(
    PH_EVENT_USER_CLICKED_DATA_DELETION_SEARCH_RESULTS_CONTINUE_BUTTON,
    {
      isForcingNewSearch: props.isForcingNewSearch,
    }
  );
};

const table = ref(null);

let observer = null;

onMounted(() => {
  observer = new IntersectionObserver(
    ([tableEntry]) => {
      if (tableEntry.isIntersecting) {
        posthogCapture("user_viewed_data_deletion_records");
        observer.disconnect();
      }
    },
    { threshold: 0.75 }
  );

  observer.observe(table.value);
});

onUnmounted(() => observer.disconnect());

const onShowMoreRecords = () => {
  isExpanded.value = true;
  posthogCapture("user_clicked_data_deletion_show_more_records");
};

const onRecordExpanded = (record, index) => {
  posthogCapture("user_clicked_data_deletion_show_record_details", {
    brokerName: record?.brokerName ?? null,
    depth: Math.floor(((index + 1) / props.records.length) * 100) / 100,
  });
};
</script>

<template>
  <div
    ref="table"
    class="scan-results-table"
  >
    <div class="scan-results-table__header">
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table__header-cell"
      >
        Site
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table__header-cell"
      >
        Name
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table__header-cell"
      >
        Locations
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table__header-cell"
      >
        Relatives
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table__header-cell"
      >
        Phones
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table__header-cell"
      >
        More
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="scan-results-table__header-cell"
      >
        Status
      </BaseText>
    </div>
    <TransitionGroup :name="isExpanded ? 'record-row' : null">
      <DataDeleteScanResultsTableRow
        v-for="(record, index) in isExpanded ? records : [records[0]]"
        :key="record.id"
        :record="record"
        class="scan-results-table__row"
        @expanded="onRecordExpanded(record, index)"
        @delete="onDelete"
      />
    </TransitionGroup>
    <button
      v-if="!isExpanded && records.length > 1"
      class="scan-results-table__expand"
      @click="onShowMoreRecords"
    >
      <InlineSvg name="plus" />
      Show more records
    </button>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.record-row-enter-active,
.record-row-leave-active {
  transition: all 0.5s ease-out;
}

.record-row-enter-from,
.record-row-leave-to {
  filter: blur(10px); // to be discussed
}

.scan-results-table {
  max-width: 1010px;
  margin: 32px auto 0;
  border-radius: 12px;
  overflow: hidden;
  background: $color-base-black-5;

  @media all and (min-width: $screen-xl) {
    border-radius: 16px;
  }

  &__header {
    display: none;

    @media all and (min-width: $screen-xl) {
      display: grid;
      grid-template-columns: 160fr 120fr 115fr 130fr 108fr 70fr 60fr;
      padding: 14px 16px;
      gap: 16px;
      background: $color-base-black-5;
    }

    &-cell {
      text-transform: uppercase;
      opacity: 0.7;
    }
  }

  &__row {
    &:nth-child(odd) {
      background: $color-base-black-5;
    }
  }

  &__expand {
    width: 100%;
    padding: 20px;
    background: $color-base-black-5;
    border: none;
    color: $color-primary-100;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
