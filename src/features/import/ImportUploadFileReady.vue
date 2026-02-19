<script setup>
import { HELP_CENTER_IMPORT_URL } from "@/scripts/constants";
import FileReady from "@/assets/icons/file-csv.svg";
</script>
<template>
  <span>
    <FileReady class="import-upload-file__icon upload-ready__icon" />
    <span class="import-upload-file__content">
      <span class="import-upload-file__label">
        Drag and drop a
        <strong>.csv</strong>
        file here or browse your device.
        <br />
        <span class="import-upload-file__button">Select File</span>
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

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.upload-ready__icon {
  .file-csv__fill {
    fill: $color-primary-100;
  }

  .file-csv__stroke {
    stroke: $color-primary-100;
  }
}
</style>
