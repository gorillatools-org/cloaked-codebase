<script setup>
import { HELP_CENTER_IMPORT_URL } from "@/scripts/constants";
import FileUnsupported from "@/assets/icons/file-unsupported.svg";
import store from "@/store";
import { computed } from "vue";
const emit = defineEmits(["remove"]);

const fileName = computed(() => store.getters["accountsImporter/getFileName"]);
const fileType = computed(() => store.getters["accountsImporter/getFileType"]);
</script>

<template>
  <span>
    <FileUnsupported class="import-upload-file__icon" />
    <span class="file-unsupported__type">.{{ fileType }}</span>
    <span class="import-upload-file__content">
      <span class="import-upload-file__label">
        <span class="import-upload-file__title">File is too large</span>
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
        You may want to break this file up into smaller files and import them
        individually.
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

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.file-unsupported {
  &__type {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -100%, 0);
    font-weight: 600;
    font-size: 21px;
    line-height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-brand-1-90;
    z-index: 1;
    height: 90px;
  }
}
</style>
