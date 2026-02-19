<script setup>
import { HELP_CENTER_IMPORT_URL } from "@/scripts/constants";
import FileUnsupported from "@/assets/icons/file-unsupported.svg";
import store from "@/store";
import { computed } from "vue";
const emit = defineEmits(["remove"]);

const fileName = computed(() => store.getters["accountsImporter/getFileName"]);
</script>

<template>
  <span>
    <FileUnsupported class="import-upload-file__icon" />
    <span class="import-upload-file__content">
      <span class="import-upload-file__label">
        <span class="import-upload-file__title">Unsupported file format</span>
        {{ fileName }}
        <br />
        <span
          class="import-upload-file__button"
          @click.prevent="emit('remove')"
        >
          Try again
        </span>
      </span>
    </span>
    <span class="import-upload-file__after-content">
      <span class="import-upload-file__after-content-title">
        It seems this file doesn’t use commas to separate data, please upload a
        file that uses the CSV format.
      </span>
      <span class="import-upload-file__after-content-text">
        <a
          :href="HELP_CENTER_IMPORT_URL"
          target="_blank"
          class="import-upload-file__after-content-link"
        >
          Click here for help resolving the issue.
        </a>
      </span>
    </span>
  </span>
</template>
