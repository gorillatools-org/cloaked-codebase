<script setup>
import { uniq } from "lodash-es";
import FileIcon from "@/assets/icons/file-upload.svg";
import FileLoadingIcon from "@/assets/icons/loading-small.svg";
import CloseXIcon from "@/assets/icons/close-x-actionbar.svg";

import { computed, watch } from "vue";
import { useToast } from "@/composables/useToast.js";
import { validation } from "@/scripts/validation";
import { regex } from "@/scripts/regex";
import BaseText from "@/library/BaseText.vue";

const toast = useToast();

const props = defineProps({
  files: { type: Array, default: null },
  error: Boolean,
  errors: { type: [Boolean, String], default: null },
});

const emit = defineEmits(["remove"]);

const maxPayload = computed(() => {
  return validation.maxPayload(props.files);
});
const ruleErrors = computed(() => {
  return props.error || props.files.length > 5;
});
const hasErrors = computed(() => {
  return ruleErrors.value || props.files.find((f) => f.error) !== undefined;
});

watch(
  () => hasErrors.value,
  (value) => {
    if (value) {
      let hasBanned;
      if (props.files) {
        hasBanned = uniq(
          props.files
            .filter((file) => {
              return regex.isTypeBanned(file.content_type, file.filename);
            })
            .map((file) => {
              const find = regex.isTypeBanned(file.content_type, file.filename);
              return find.mime;
            })
        );
      }
      toast.error(
        hasBanned.length > 0
          ? `We do not allow attachment of file ${
              hasBanned.length > 1 ? ` types:` : ` type:`
            } ${hasBanned.join(", ")}.`
          : `You can only attach a maximum of 5 files that total. ${
              props.errors || ""
            }`,
        {
          pauseOnFocusLoss: false,
          pauseOnHover: false,
        }
      );
    }
  },
  { deep: true }
);

function removeFile(fileKey) {
  emit("remove", fileKey);
}
</script>

<template>
  <div
    v-if="props.files.length > 0"
    class="file-list"
    :class="{ error_m: ruleErrors }"
  >
    <div
      v-for="(file, index) in props.files"
      :key="index"
      class="file"
      :class="{ error: file.error || maxPayload }"
    >
      <button
        v-if="file.uploading"
        class="icon"
      >
        <FileLoadingIcon />
      </button>
      <button
        v-else
        class="icon"
      >
        <FileIcon />
      </button>
      <button
        class="delete"
        @click="removeFile(file.key)"
      >
        <CloseXIcon />
      </button>
      <BaseText
        variant="body-small-medium"
        class="file-name"
      >
        {{ file.filename }}
      </BaseText>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.file-list {
  padding: 5px;
  border-radius: 8px;

  .error_m {
    background-color: $color-alert;
    border: 1px solid $color-alert-tint;
    color: $white;
  }

  .image {
    .file-name {
      display: none;
    }
  }

  .file {
    margin: 5px 0;
    padding: 4px 8px 4px 4px;
    background: $color-base-white-100;
    border-radius: 24px;
    display: inline-flex;
    gap: 5px;
    color: $color-primary-100;

    &.error {
      background-color: $color-alert;
      border: 1px solid $color-alert-tint;
      color: $white;

      svg {
        filter: invert(100%);
      }
    }

    &:hover {
      .delete {
        display: block;
      }

      .icon {
        display: none;
      }
    }

    button {
      border: none;
      background-color: transparent;
      height: 15px;
      width: 18px;

      svg {
        height: 13px;
        width: auto;
        color: $color-primary-100;
      }
    }

    .delete {
      display: none;
    }
  }
}

button {
  cursor: pointer !important;
}

.search_results {
  flex: 1;
  max-height: 300px;
  overflow-y: auto;

  @include custom-scroll-bar;

  .results {
    .search-items {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .search-item {
      gap: 15px;
      align-items: center;
      border-radius: 50px;
      display: inline-flex;
      padding: 3px 12px;
      background-color: transparent;

      svg {
        display: none;
      }

      &.active {
        background-color: $color-base-white-5;

        svg {
          display: inline-block;
        }
      }

      &.selected {
        svg {
          display: block;
        }
      }
    }
  }
}

.header-line {
  margin-bottom: 5px;

  button {
    cursor: pointer;
  }
}

.disabled {
  opacity: 0.5;
}

.error_m {
  background-color: #fae3e3 !important;
  transition: background-color 1s ease;
}

.to_row {
  width: 100%;
  border-radius: 8px;
  display: grid;
  align-items: start;
  grid-template-columns: 90% 10%;

  .cc_button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    height: 100%;
  }
}

:focus {
  outline: none;
  background-color: $color-base-white-30;
}
</style>
