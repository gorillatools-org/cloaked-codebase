<script setup>
import DataDeletePageNoResults from "@/features/data-delete/DataDeletePageNoResults.vue";
import DataDeletePagePhoneResults from "@/features/data-delete/DataDeletePagePhoneResults.vue";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_RESULTS } from "@/scripts/posthogEvents";
import { onMounted, useAttrs } from "vue";
import DataDeleteTryAgain from "@/features/data-delete/DataDeleteTryAgain.vue";
import UserService from "@/api/actions/user-service";
import { DATA_DELETE_SEARCHED_EXPOSURES } from "@/scripts/userFlags";
import { posthogCapture } from "@/scripts/posthog.js";
import DataDeleteScanResultsTableCompact from "@/features/data-delete/DataDeleteScanResultsTableCompact.vue";

const attrs = useAttrs();

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_RESULTS, {
    results: attrs.numTotalResults ?? 0,
    searchType: attrs.phone ? "phone" : "name",
    isForcingNewSearch: attrs.isForcingNewSearch,
    hasError: attrs.hasError,
  });

  UserService.setFlag({
    name: DATA_DELETE_SEARCHED_EXPOSURES,
    value: true,
  });
});
</script>

<template>
  <DataDeleteTryAgain v-if="$attrs.hasError" />
  <div v-else-if="$attrs.searchResults[0]">
    <DataDeletePagePhoneResults v-bind="{ ...$attrs, class: null }" />
    <DataDeleteScanResultsTableCompact
      v-if="$attrs.records?.length && !$attrs.isForcingNewSearch"
      v-bind="{ ...$attrs, class: null }"
      class="data-delete-results__table"
    />
  </div>
  <DataDeletePageNoResults
    v-else
    v-bind="$attrs"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;

  &.data-delete-phone-results {
    padding-bottom: 92px + 8px !important;
  }

  &.data-delete-no-results {
    padding-bottom: 140px + 8px !important;
  }

  @media all and (min-width: $screen-xl) {
    flex-direction: row-reverse;
    justify-content: center;
    align-items: flex-start;
    gap: 90px;
    padding-bottom: 25px !important;
  }

  &__column {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;

    &:first-child {
      align-items: center;
    }

    @media all and (min-width: $screen-xl) {
      flex-basis: 50%;
      flex-grow: 1;
      max-width: 560px;
      align-self: auto;
      margin-top: clamp(40px, 5vh, 150px);

      &:first-child {
        align-items: flex-start;
      }
    }
  }

  .data-delete__title,
  .data-delete__text {
    @media all and (min-width: $screen-xl) {
      text-align: start;
    }
  }

  &__table {
    z-index: 1;
    margin-top: -64px;
    margin-bottom: 32px + 60px;
    max-width: 2 * 560px + 90px;
    width: 100%;

    @media all and (min-width: $screen-xl) {
      margin-top: -32px;
      margin-bottom: 32px;
    }
  }
}
</style>
