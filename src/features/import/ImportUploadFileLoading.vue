<script setup>
import { HELP_CENTER_IMPORT_URL } from "@/scripts/constants";
import FileLoading from "@/assets/icons/file-loading.svg";
import store from "@/store";
import { computed } from "vue";
const emit = defineEmits(["remove"]);

const fileName = computed(() => store.getters["accountsImporter/getFileName"]);
</script>

<template>
  <span>
    <FileLoading class="import-upload-file__icon" />
    <span class="import-upload-file__content">
      <span
        class="import-upload-file__label import-upload-file__label--loading"
      >
        Uploading {{ fileName }}...
        <br />
        <button
          class="import-upload-file__action"
          @click.prevent="emit('remove')"
        >
          Cancel
        </button>
      </span>
    </span>
    <span class="import-upload-file__after-content">
      <span class="import-upload-file__after-content-text">
        Files must be less than 24 mb.
        <a
          :href="HELP_CENTER_IMPORT_URL"
          target="_blank"
          class="import-upload-file__after-content-link"
        >
          Check out our help articles
        </a>
        for file formatting tips.
      </span>
    </span>
  </span>
</template>
