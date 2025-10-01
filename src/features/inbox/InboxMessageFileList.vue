<script setup>
import { uniq } from "lodash-es";
import { maxPayload } from "@/scripts/validation";
import FileIcon from "@/assets/icons/inbox/file.svg";
import FileLoadingIcon from "@/assets/icons/loading-small.svg";
import CloseXIcon from "@/assets/icons/close-x-actionbar.svg";
import { isTypeBanned } from "@/scripts/regex";
import { useToast } from "@/composables/useToast.js";
import { computed, watch } from "vue";
import BaseText from "@/library/BaseText.vue";

const toast = useToast();

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  error: { type: Boolean, default: false },
  errors: { type: [Boolean, String], default: null },
});

const emit = defineEmits(["remove"]);

const payloadMaxedOut = computed(() => {
  return maxPayload(props.files);
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
              return isTypeBanned(file.content_type, file.filename);
            })
            .map((file) => {
              const find = isTypeBanned(file.content_type, file.filename);
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

function getFileSizeDisplay(size) {
  const kb = size / 1000;
  if (kb < 1000) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1000;
  return `${mb.toFixed(1)} MB`;
}
</script>

<template>
  <div
    v-if="props.files.length > 0"
    class="file-list"
    :class="{ 'error-main': ruleErrors }"
  >
    <div
      v-for="(file, index) in props.files"
      :key="index"
      class="file"
      :class="{ error: file.error || payloadMaxedOut }"
    >
      <FileLoadingIcon
        v-if="file.uploading"
        class="icon"
      />
      <FileIcon
        v-else
        class="file-icon"
      />
      <CloseXIcon
        class="delete"
        @click="removeFile(file.key)"
      />
      <BaseText
        as="div"
        variant="body-small-medium"
        class="file-name"
      >
        {{ file.filename }}
      </BaseText>
      <BaseText
        as="div"
        variant="body-small-medium"
        class="file-size"
      >
        {{ getFileSizeDisplay(file.size) }}
      </BaseText>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.file-list {
  &.error-main {
    background-color: $color-alert;
    border: 1px solid $color-alert-tint;
    color: $white;
  }

  .file {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 5px 0;
    padding: 5px 12px;
    background: $color-primary-10;
    border-radius: 31px;
    display: inline-flex;
    gap: 4px;
    color: $color-primary-100;
    cursor: pointer;

    .file-size {
      color: $color-primary-70;
    }

    .file-icon {
      color: $color-brand-6-100;
    }

    &.error {
      background-color: $color-alert;
      border: 1px solid $color-alert-tint;

      .file-size {
        color: $color-primary-90;
      }
    }

    &:hover {
      .delete {
        display: block;
      }

      .icon {
        display: none;
      }

      .file-icon {
        display: none;
      }
    }

    .delete {
      display: none;
    }
  }
}
</style>
