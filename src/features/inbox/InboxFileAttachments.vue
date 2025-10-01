<script setup>
import { uniq } from "lodash-es";
import axios from "axios";
import Paperclip from "@/assets/icons/paperclip.svg";
import { isTypeBanned, regex } from "@/scripts/regex";
import { reactive, watch, ref, computed } from "vue";
import { useToast } from "@/composables/useToast.js";
import InboxService from "@/api/actions/inbox-service";
import UiTooltip from "@/features/ui/ui-tooltip";
import { constants } from "@/scripts/constants";
import { validation } from "@/scripts/validation";

const toast = useToast();

const props = defineProps({
  filter: { type: [Boolean, Function], default: null },
  endpoint: { type: String, default: null },
  disabled: Boolean,
  filesForRemoval: { type: Array, default: null },
  isTextMessage: Boolean,
});

const emit = defineEmits(["change", "filesRemoved"]);

const fileupload = ref(null);

const state = reactive({
  files: [],
});

const totalFileSize = computed(() => {
  return state.files.reduce((acc, file) => {
    return acc + file.size;
  }, 0);
});

const isDisabled = computed(() => {
  return (
    props.disabled ||
    state.files.length >= constants.INBOX_ATTACHMENT_MAX_FILE_LIMIT
  );
});

watch(
  () => totalFileSize.value,
  (value) => {
    if (value > validation.FILE_SIZE_LIMIT) {
      toast.error("Total file size limit exceeded");
    }
  },
  { deep: true }
);

watch(
  () => state.files,
  (value) => {
    emit("change", value);
  },
  { deep: true }
);

watch(
  () => props.filesForRemoval,
  (value) => {
    if (value.length) {
      value.forEach((fileKey) => {
        removeFile(fileKey);
      });
      emit("filesRemoved", value);
    }
  },
  { deep: true }
);

function handleUpload(event) {
  const files = Array.from(event.target.files).map((f, i) => {
    f.index = i;
    return f;
  });
  let errors = files.filter((file) => {
    return (
      file.size >= validation.FILE_SIZE_LIMIT ||
      isTypeBanned(file.type, file.name)
    );
  });
  if (props.filter) {
    errors = [
      ...errors,
      ...files.filter((file) => {
        return props.filter(file);
      }),
    ];
  }
  const unique = [...new Set(errors.map((item) => item.index))].map((i) => {
    return files[i];
  });
  errors = unique.map((file) => {
    return {
      filename: file.name,
      error: true,
      size: file.size,
      content_type: file.type.includes("jpg") ? "image/jpeg" : file.type,
    };
  });

  const errorNames = errors.map((file) => file.filename);

  const filenames = files
    .filter((file) => !errorNames.includes(file.name))
    .filter((file) => file.size < validation.FILE_SIZE_LIMIT)
    .map((f) => f.name);

  if (props.isTextMessage) {
    InboxService.handleMessageUploads({ filenames })
      .then(({ data }) => {
        return successfulUpload(data);
      })
      .catch(errorUpload);
  } else if (filenames.length) {
    InboxService.handleEmailUploads({ filenames })
      .then(({ data }) => {
        return successfulUpload(data);
      })
      .catch(errorUpload);
  }

  if (errors.length > 0) {
    const hasBanned = uniq(
      errors
        .filter((file) => {
          return regex.isTypeBanned(file.content_type, file.filename);
        })
        .map((file) => {
          const find = regex.isTypeBanned(file.content_type, file.filename);
          return find.mime;
        })
    );
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
  // }

  function successfulUpload(data) {
    // after the activity encryption transition, the behaviour is changed

    if (Array.isArray(data)) {
      data = data[0];
    }
    const { urls, errors } = data;
    if (errors) {
      throw { response: { data: { errors } } };
    }
    files.map((file, index) => {
      saveFile(file, urls[index]);
    });
  }

  function errorUpload() {
    toast.error("Upload failed. Please try again.");
  }
}
function saveFile(file, s3) {
  const req = axios.create();
  state.files = [
    ...state.files,
    {
      ...s3,
      size: file.size,
      content_type: file.type,
      uploading: true,
      uploaded: false,
    },
  ];
  req
    .put(s3.url, file, {
      headers: {
        "Content-Type": file.type,
      },
    })
    .then(() => {
      state.files = [...state.files].map((f) => {
        if (f.key === s3.key) {
          return {
            filename: s3.filename,
            key: s3.key,
            content_type: file.type,
            size: file.size,
          };
        }
        return f;
      });
    });
}

function openFile() {
  if (isDisabled.value) {
    return;
  }
  fileupload?.value?.click();
}

function removeFile(fileKey) {
  state.files = [...state.files].filter((file) => file.key !== fileKey);
  if (fileupload?.value?.value) {
    fileupload.value.value = "";
  }
}
</script>

<template>
  <div :class="{ disabled: isDisabled }">
    <input
      ref="fileupload"
      type="file"
      style="opacity: 0; display: none; position: absolute"
      multiple
      :disabled="isDisabled"
      :accept="
        props.isTextMessage
          ? constants.FILE_PERMISSIONS.TEXT_ALLOWED.map((ext) => `.${ext}`)
          : undefined
      "
      @change="handleUpload"
    />
    <UiTooltip
      align-x="center"
      :title="
        isDisabled
          ? 'Max file limit reached. Remove a file to add another'
          : 'Attach files'
      "
      class="attachment-icon"
      @click="openFile"
    >
      <Paperclip />
    </UiTooltip>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.disabled {
  .attachment-icon {
    opacity: 0.5;
  }
}

.error_message {
  font-size: 14px;
  line-height: 20px;

  button {
    border: none;
    cursor: pointer;
    font-size: 12px;
    display: inline-block;
    text-decoration: underline;
    background-color: transparent;
  }
}

.filelist {
  padding: 5px;
  border-radius: 8px;

  .error_m {
    background-color: $color-alert;
    border: 1px solid $color-alert-tint;
  }

  .file {
    margin: 5px 0;
    padding: 4px 8px 4px 4px;
    background: $color-background;
    border-radius: 24px;
    font-size: 12px;
    display: inline-flex;
    gap: 5px;

    &.error {
      background-color: $color-alert;
      border: 1px solid $color-alert-tint;
    }

    &:hover {
      background: $color-background;

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
      }
    }

    .delete {
      display: none;
    }
  }
}

.attachment-icon {
  height: 30px;
  width: 30px;
  color: $color-primary-100;
  border: none;
  background-color: transparent;
  cursor: pointer !important;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: $color-primary-10;
  }
}

.icon {
  color: $color-primary-100;
}
</style>
