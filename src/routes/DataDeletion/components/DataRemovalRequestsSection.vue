<script setup>
import { computed, ref } from "vue";
import DataRemovalRequestsRow from "@/routes/DataDeletion/components/RequestRows/DataRemovalRequestsRow.vue";
import store from "@/store";
import AtomSkeletonLoaderRow from "@/library/AtomSkeletonLoaderRow.vue";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  requests: {
    type: Array,
    required: true,
  },
  actionRequiredFamilies: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  actionRequiredBrokersGroupedByFamily: {
    type: Object,
    default: () => {},
  },
});

const defaultListSize = 5;

const showAll = ref(false);

const limitedRequests = computed(() => {
  return showAll.value
    ? props.requests
    : props.requests.slice(0, defaultListSize);
});

function toggleShowAll() {
  showAll.value = !showAll.value;
}

function toggleOpen(request, forceOpen = false) {
  const requestsCopy = [...props.requests]?.map((req) => {
    if (req.id === request.id) {
      req.opened = forceOpen ? forceOpen : !req.opened;
    } else {
      // Only one should be opened at a time
      req.opened = false;
    }
    return req;
  });
  return store.dispatch("dataDelete/updateRemovalLogBrokerList", requestsCopy);
}
</script>

<template>
  <div class="removal-requests">
    <div class="requests-table">
      <div class="requests-table-header">
        <BaseText
          as="div"
          variant="headline-6-medium"
          class="requests-table-cell"
        >
          Broker
        </BaseText>
        <BaseText
          as="div"
          variant="headline-6-medium"
          class="requests-table-cell"
        >
          Status
        </BaseText>
        <BaseText
          as="div"
          variant="headline-6-medium"
          class="requests-table-cell long"
        >
          Removal progress
        </BaseText>
        <BaseText
          as="div"
          variant="headline-6-medium"
          class="requests-table-cell short"
        >
          Progress
        </BaseText>
      </div>
      <AtomSkeletonLoaderRow
        v-if="props.loading"
        :num-of-rows="defaultListSize"
        height="73px"
      />
      <div
        v-else
        class="requests-table-body"
      >
        <DataRemovalRequestsRow
          v-for="(request, index) in limitedRequests"
          :key="`${index}-${request.broker_name}`"
          :request="request"
          @open="() => toggleOpen(request)"
        />
      </div>
    </div>
    <button
      v-if="props.requests.length > defaultListSize"
      class="toggle-button"
      @click="toggleShowAll"
    >
      {{ showAll ? "Show fewer" : "Show all" }}
    </button>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.removal-requests {
  background-color: $color-base-white-100;
  border-radius: 12px;
  margin-top: 8px;
}

.requests-table {
  width: 100%;
  border-collapse: collapse;
  color: $color-primary-100;

  .requests-table-header {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    .requests-table-cell {
      display: flex;
      flex: 1;
      text-align: left;
      margin-bottom: 16px;

      &.short {
        display: none;
      }
      &.long {
        display: flex;
      }
      @media (max-width: 555px) {
        &.short {
          display: flex;
        }
        &.long {
          display: none;
        }
      }
    }
  }

  .requests-table-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.toggle-button {
  width: 100%;
  padding: 10px;
  border: 1px solid $color-primary-100;
  border-radius: 8px;
  background-color: $color-base-white-100;
  cursor: pointer;
  margin-top: 32px;
  color: $color-primary-100;
  transition: all 0.3s ease-in;
  &:hover {
    background-color: $color-primary-100;
    color: $color-primary-1;
    transition: all 0.3s ease-in;
  }
}
</style>
