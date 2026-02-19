<script setup>
import ImportUploadFileReady from "@/features/import/ImportUploadFileReady.vue";
import ImportUploadFileLoading from "@/features/import/ImportUploadFileLoading.vue";
import ImportUploadFileSuccess from "@/features/import/ImportUploadFileSuccess.vue";
import ImportUploadFileErrorUnsupported from "@/features/import/ImportUploadFileErrorUnsupported.vue";
import ImportUploadFileErrorAlternateDelimiters from "@/features/import/ImportUploadFileErrorAlternateDelimiters.vue";
import ImportUploadFileWarningFormattingIssues from "@/features/import/ImportUploadFileWarningFormattingIssues.vue";
import ImportUploadFileWarningExtraColumns from "@/features/import/ImportUploadFileWarningExtraColumns.vue";
import ImportUploadFileErrorFileTooLarge from "@/features/import/ImportUploadFileErrorFileTooLarge.vue";

import {
  FILE_UPLOAD_ERROR,
  FILE_UPLOAD_ERROR_ALTERNATE_DELIMITERS,
  FILE_UPLOAD_ERROR_UNSUPPORTED,
  FILE_UPLOAD_LOADING,
  FILE_UPLOAD_READY,
  FILE_UPLOAD_SUCCESS,
  FILE_UPLOAD_WARNING_EXTRA_COLUMNS,
  FILE_UPLOAD_WARNING,
  SUPPORTED_FILE_TYPES,
  FILE_UPLOAD_WARNING_HAS_TABLE_HEAD,
  FILE_UPLOAD_WARNING_EXTRA_FIELDS,
  FILE_UPLOAD_ERROR_FILE_TOO_LARGE,
} from "@/store/modules/accounts-importer/shared.js";
import { computed, ref } from "vue";
import store from "@/store";

defineProps({
  id: {
    type: String,
    default: "import-file-upload",
  },
  fileType: {
    type: String,
    default: SUPPORTED_FILE_TYPES.join(", "),
  },
});

const dragState = ref(null);
const dragStateTimeout = ref(null);
const fileInput = ref(null);

const getFileUploadState = computed(
  () => store.getters["accountsImporter/getFileUploadState"]
);

const stateClasses = computed(() => {
  const UI_READY = "ready";
  const UI_LOADING = "loading";
  const UI_SUCCESS = "success";
  const UI_WARNING = "warning";
  const UI_ERROR = "error";

  const parsingStateToUiStateMap = {
    [FILE_UPLOAD_READY]: UI_READY,
    [FILE_UPLOAD_LOADING]: UI_LOADING,
    [FILE_UPLOAD_SUCCESS]: UI_SUCCESS,
    [FILE_UPLOAD_WARNING]: UI_WARNING,
    [FILE_UPLOAD_WARNING_HAS_TABLE_HEAD]: UI_WARNING,
    [FILE_UPLOAD_WARNING_EXTRA_COLUMNS]: UI_WARNING,
    [FILE_UPLOAD_WARNING_EXTRA_FIELDS]: UI_WARNING,
    [FILE_UPLOAD_ERROR]: UI_ERROR,
    [FILE_UPLOAD_ERROR_UNSUPPORTED]: UI_ERROR,
    [FILE_UPLOAD_ERROR_ALTERNATE_DELIMITERS]: UI_ERROR,
    [FILE_UPLOAD_ERROR_FILE_TOO_LARGE]: UI_ERROR,
  };

  if (dragState.value) {
    return [
      `import-upload-file--${
        parsingStateToUiStateMap[getFileUploadState.value]
      }`,
      `import-upload-file--drag-${parsingStateToUiStateMap[dragState.value]}`,
    ];
  } else {
    return `import-upload-file--${
      parsingStateToUiStateMap[getFileUploadState.value]
    }`;
  }
});

const feedbackComponent = computed(() => {
  const parsingStateToFeedbackComponentMap = {
    [FILE_UPLOAD_READY]: ImportUploadFileReady,
    [FILE_UPLOAD_LOADING]: ImportUploadFileLoading,
    [FILE_UPLOAD_SUCCESS]: ImportUploadFileSuccess,
    [FILE_UPLOAD_WARNING]: ImportUploadFileWarningFormattingIssues,
    [FILE_UPLOAD_WARNING_HAS_TABLE_HEAD]:
      ImportUploadFileWarningFormattingIssues,
    [FILE_UPLOAD_WARNING_EXTRA_COLUMNS]: ImportUploadFileWarningExtraColumns,
    [FILE_UPLOAD_WARNING_EXTRA_FIELDS]: ImportUploadFileWarningFormattingIssues,
    [FILE_UPLOAD_ERROR]: ImportUploadFileErrorUnsupported,
    [FILE_UPLOAD_ERROR_UNSUPPORTED]: ImportUploadFileErrorUnsupported,
    [FILE_UPLOAD_ERROR_ALTERNATE_DELIMITERS]:
      ImportUploadFileErrorAlternateDelimiters,
    [FILE_UPLOAD_ERROR_FILE_TOO_LARGE]: ImportUploadFileErrorFileTooLarge,
  };

  return parsingStateToFeedbackComponentMap[getFileUploadState.value];
});

function onChange(event) {
  const file = event.target.files[0];
  onRemove();
  store.dispatch("accountsImporter/importFile", file);
}
function onDrop(event) {
  onRemove();
  store.dispatch(
    "accountsImporter/importFile",
    event.dataTransfer.items[0].getAsFile()
  );
  dragState.value = null;
}
function onRemove() {
  fileInput.value = "";
  store.dispatch("accountsImporter/remove");
}
function updateDragState(newDragState) {
  clearTimeout(dragStateTimeout.value);

  if (newDragState) {
    dragState.value = newDragState;
  } else {
    dragStateTimeout.value = setTimeout(() => {
      dragState.value = newDragState;
    }, 50);
  }
}
function onDragOver(event) {
  if (!SUPPORTED_FILE_TYPES.includes(event.dataTransfer.items?.[0]?.type)) {
    updateDragState(FILE_UPLOAD_ERROR_UNSUPPORTED);
  } else {
    updateDragState(FILE_UPLOAD_SUCCESS);
  }
}
function onDragLeave() {
  updateDragState(null);
}
</script>

<template>
  <label
    :id="id"
    class="import-upload-file"
    :class="stateClasses"
    @drop.prevent="onDrop"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
  >
    <span class="import-upload-file__box">
      <Component
        :is="feedbackComponent"
        @remove="onRemove"
      />
      <input
        ref="fileInput"
        :accept="fileType"
        :for="id"
        class="import-upload-file__input"
        type="file"
        @change="onChange"
      />
    </span>
  </label>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.import-upload-file {
  border-radius: 16px;
  padding: 24px;
  border-width: 1px;
  border-style: dashed;
  border-color: $color-primary-50;
  height: 740px;
  display: flex;
  cursor: pointer;
  overflow: auto;
  margin-bottom: 24px;

  @include custom-scroll-bar;

  &__box {
    margin: auto;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    &::before {
      content: "";
      display: block;
      width: 340px;
      height: 340px;
      border-radius: 100%;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate3d(-50%, -50%, 0);

      @at-root .import-upload-file--ready & {
        background: $color-base-white-100;
        border: 1px solid $color-primary-100;
      }

      @at-root .import-upload-file--loading & {
        background: $color-brand-5-90;
        border: 1px solid $color-brand-5-30;
      }

      @at-root .import-upload-file--success & {
        background: $color-brand-6-90;
        border: 1px solid $color-brand-6-90;
      }

      @at-root .import-upload-file--error & {
        background: $color-brand-1-10;
        border: 1px solid $color-brand-1-30;
      }

      @at-root .import-upload-file--warning & {
        background: $color-warning-light;
        border: 1px solid $color-warning;
      }

      @at-root .import-upload-file--drag-success & {
        border: 5px solid $color-brand-6-90;
      }

      @at-root .import-upload-file--drag-error & {
        border: 4px solid $color-brand-1-90;
      }

      @at-root .import-upload-file--drag-warning & {
        border: 5px solid $color-warning;
      }
    }
  }

  &__title {
    display: block;
    font-weight: 500;
    font-size: 20px;
    line-height: 30px;
  }

  &__button {
    display: inline-flex;
    margin-top: 14px;
    align-items: center;
    height: 44px;
    padding: 0 22px;
    border-radius: 22px;
    border: 1px solid $color-primary-100;
    color: $color-primary-100;
    font-family: $global-font;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    overflow: hidden;
    cursor: pointer;

    @at-root .theme-dark .import-upload-file--error & {
      border: 1px solid $color-primary-10-light;
      color: $color-primary-10-light;
    }
  }

  &__icon {
    position: absolute;
    z-index: 1;
    margin-bottom: 16px;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -100%, 0);
  }

  &__content {
    width: 400px;
    display: flex;
    justify-content: center;
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, 16px, 0);
  }

  &__label {
    text-align: center;
    font-size: 14px;
    line-height: 26px;
    width: 250px;
    word-break: break-all;

    &--loading {
      width: 400px;
    }
  }

  &__action {
    display: block;
    font-weight: 500;
    font-size: 14px;
    line-height: 21px;
    text-decoration-line: underline;
    background: none;
    border: none;
    cursor: pointer;
    pointer-events: none;
    margin: 24px auto 0;
  }

  &__input {
    display: none;
  }

  &__title,
  &__label,
  &__action {
    @at-root .import-upload-file--ready & {
      color: $color-primary-100;
    }

    @at-root .import-upload-file--loading & {
      color: $color-primary-100;
    }

    @at-root .import-upload-file--success & {
      color: $white;
    }

    @at-root .import-upload-file--error & {
      color: $color-brand-1-90;
    }

    @at-root .import-upload-file--warning & {
      color: $color-primary-100;

      @at-root .theme-dark & {
        color: $color-primary-100-light;
      }
    }
  }

  &__after-content {
    position: absolute;
    display: block;
    z-index: 1;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, 210px, 0);
    max-width: 100%;
    width: 100%;
    text-align: center;
    padding-bottom: 30px;

    &-title {
      font-weight: 600;
      font-size: 13px;
      line-height: 20px;
      color: $color-primary-100;
      display: block;
    }

    &-text {
      font-weight: 400;
      font-size: 13px;
      line-height: 20px;
      color: $color-primary-100;
      display: block;
    }

    &-link {
      text-decoration: underline;
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      opacity: 0.8;

      &:hover {
        opacity: 1;
        transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
        transform: scale(1.05);
      }
    }
  }
}
</style>
