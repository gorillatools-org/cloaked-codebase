<script setup>
import { HELP_CENTER_IMPORT_URL } from "@/scripts/constants";
import FileWarning from "@/assets/icons/file-warning.svg";
import { computed } from "vue";
import store from "@/store";

const emit = defineEmits(["remove"]);

const fileName = computed(() => store.getters["accountsImporter/getFileName"]);
</script>

<template>
  <span>
    <FileWarning class="import-upload-file__icon" />
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
        The file may have formatting issues.
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
