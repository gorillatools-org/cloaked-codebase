<script setup>
import MappingTableLabelSelect from "@/features/import/MappingTableLabelSelect";
import ImportTable from "@/features/import/ImportTable";
import PasswordPreview from "@/features/ui/PasswordPreview";
import UrlPreview from "@/features/import/UrlPreview";
import {
  FIELD_PASSWORD,
  FIELD_TO_LABEL_MAPPING,
  LABEL_IGNORE,
  FIELD_WEBSITE,
} from "@/store/modules/accounts-importer/shared.js";
import MappingTableFileColumn from "@/features/import/MappingTableFileColumn.vue";
import store from "@/store";
import { computed } from "vue";

defineProps({
  importedRecords: {
    type: Array,
    default: () => [],
  },
});
const importedColumns = computed(
  () => store.getters["accountsImporter/getImportedColumns"]
);
const importedFields = computed(
  () => store.getters["accountsImporter/getImportedFields"]
);
const passwordColumnIndex = computed(() =>
  store.getters["accountsImporter/getColumnIndex"](FIELD_PASSWORD)
);
const ignoredColumnIndices = computed(() =>
  store.getters["accountsImporter/getImportedFields"].reduce(
    (result, field, index) =>
      field === LABEL_IGNORE ? [...result, index] : result,
    []
  )
);
const urlColumnIndex = computed(() =>
  store.getters["accountsImporter/getColumnIndex"](FIELD_WEBSITE)
);

function onLabelSelected(label, index) {
  store.dispatch("accountsImporter/setColumnLabel", {
    label,
    index,
  });
}
</script>

<template>
  <ImportTable
    :columns="importedFields"
    :rows="importedRecords"
    class="mapping-table"
  >
    <template #head-row="{ row, cellClass }">
      <span
        v-for="(cell, index) in row"
        :key="index"
        :class="cellClass"
      >
        <MappingTableFileColumn :value="importedColumns[index]" />
        <MappingTableLabelSelect
          :value="FIELD_TO_LABEL_MAPPING[cell]"
          @input="onLabelSelected($event, index)"
        />
      </span>
    </template>
    <template #body-row="{ row, cellClass }">
      <div
        v-for="(cell, index) in row.record"
        :key="index"
        :class="cellClass"
      >
        <PasswordPreview
          v-if="index === passwordColumnIndex"
          :password="cell"
        />
        <UrlPreview
          v-else-if="index === urlColumnIndex && cell"
          :url="cell"
        />
        <span
          v-else
          :class="{
            'mapping-table__cell--ignored':
              ignoredColumnIndices.includes(index),
          }"
        >
          {{ cell || "-" }}
        </span>
      </div>
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
  </ImportTable>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.mapping-table {
  .app-table__head-row,
  .app-table__body-row {
    padding: 0 8px;
  }

  .app-table__head-row {
    height: 84px;
    align-items: flex-start;
  }

  &__cell {
    &--ignored {
      color: $color-primary-30;
    }
  }
}
</style>
