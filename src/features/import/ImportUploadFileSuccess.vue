<script setup>
import FileSuccess from "@/assets/icons/file-success.svg";
import { computed } from "vue";
import store from "@/store";

const emit = defineEmits(["remove"]);

const fileName = computed(() => store.getters["accountsImporter/getFileName"]);
const records = computed(
  () => store.getters["accountsImporter/getImportedRecords"]
);
</script>

<template>
  <span>
    <FileSuccess class="import-upload-file__icon" />
    <span class="import-upload-file__content">
      <span class="import-upload-file__label">
        <span class="import-upload-file__title">Ready for review</span>
        {{ fileName }}
        <button
          class="import-upload-file__action"
          @click.prevent="emit('remove')"
        >
          Remove
        </button>
      </span>
    </span>
    <span class="import-upload-file__after-content">
      <span class="import-upload-file__after-content-title">
        {{
          records.length === 1
            ? `${records.length} identity`
            : `${records.length} identities`
        }}
        found.
      </span>
      <span class="import-upload-file__after-content-text">
        Continue to next step to review.
      </span>
    </span>
  </span>
</template>
