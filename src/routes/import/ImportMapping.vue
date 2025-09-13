<script setup>
import MappingTable from "@/features/import/MappingTable";
import InfiniteLoader from "@/features/global/InfiniteLoader.vue";
import store from "@/store";
import { computed, ref, watch } from "vue";
const props = defineProps({
  pageLimit: {
    type: Number,
    default: 30,
  },
});
const displayedRecords = ref(props?.pageLimit);
watch(
  () => props.pageLimit,
  (newVal) => {
    displayedRecords.value = newVal;
  },
  { deep: true }
);
const hasMoreRecords = computed(
  () =>
    store.getters["accountsImporter/getImportedRecords"].length >
    displayedRecords.value
);
const importedRecords = computed(() =>
  store.getters["accountsImporter/getImportedRecords"].slice(
    0,
    displayedRecords.value
  )
);
function loadMoreRecords() {
  if (hasMoreRecords.value) {
    displayedRecords.value = displayedRecords.value + props.pageLimit;
  }
}
</script>
<template>
  <div class="import-mapping">
    <h1 class="import__step-title">Choose labels</h1>
    <div class="import-mapping__help">
      Choose a label that correctly describes what's in each column
    </div>
    <MappingTable :imported-records="importedRecords">
      <template #footer>
        <InfiniteLoader
          v-if="hasMoreRecords"
          :all-data-fetched="!hasMoreRecords"
          class="import-mapping__infinite-loader"
          @load-more="loadMoreRecords"
        />
      </template>
    </MappingTable>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.import-mapping {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__help {
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: $color-primary-50;
  }

  .import-table--maximized {
    min-height: calc(100vh - 84px - 24px);
    transform: translateY(-100px);
  }

  &__infinite-loader {
    display: flex;
    justify-content: center;
  }
}
</style>
