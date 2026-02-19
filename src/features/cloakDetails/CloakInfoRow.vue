<script setup>
import {
  computed,
  nextTick,
  reactive,
  ref,
  watch,
  markRaw,
  onBeforeMount,
} from "vue";
import { TOTP, URI } from "otpauth";
import { get } from "lodash-es";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import UiMenuSeparator from "@/features/UiMenu/UiMenuSeparator.vue";
import moment from "moment";
import { getRelativeTime } from "@/scripts/format";
import NumberLockingWarningModal from "@/features/modals/numberLocking/NumberLockingWarningModal.vue";
import NumberLockingService from "@/api/actions/number-locking-service.js";
import CloakIdentifierIcon from "@/features/cloakDetails/CloakIdentifierIcon.vue";
import CloakInfoRowButton from "@/features/cloakDetails/CloakInfoRowButton.vue";
import CloakDetailsInputRow from "@/features/cloakDetails/CloakDetailsInputRow.vue";
import { HAS_SEEN_LOCKED_NUMBERS_WARNING } from "@/scripts/userFlags";
import UserService from "@/api/actions/user-service.js";
import IdentityService from "@/api/actions/identity-service.js";
import { posthogCapture } from "@/scripts/posthog.js";
import InlineSvg from "@/features/InlineSvg.vue";
import { tools } from "@/scripts/tools";

const LOCK_TOOLTIP_TEXT = {
  open: "Lock this number to stop new incoming requests. Only contacts you've already approved will be able to reach you.",
  locked:
    "This number is permanently locked. Only contacts you've already approved will be able to reach you.",
};

const toast = useToast();

const emit = defineEmits([
  "input",
  "save",
  "delete",
  "copied",
  "generate",
  "focus",
  "blur",
]);

const inputRow = ref(null);

const props = defineProps({
  readOnly: { type: Boolean, default: false },
  placeholder: { type: String, default: null },
  initialValue: { type: String, default: null },
  field: { type: String, default: null },
  loading: { type: Boolean, default: false },
  fieldType: { type: String, default: null },
  disableEnter: { type: Boolean, default: false },
  enterCtrl: { type: Boolean, default: false },
  forceDelete: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  forceReset: { type: Boolean, default: false },
  isOnSharedPage: { type: Boolean, default: false },
  isSensitive: { type: Boolean, default: false },
  fieldLabel: { type: String, default: null },
  copyValue: { type: String, default: null },
  nickname: { type: String, default: null },
  phoneObject: { type: Object, default: null },
  breached: { type: Boolean, default: null },
  identityId: { type: Number, default: null },
  transactionNote: { type: Boolean, default: false },
});

const state = reactive({
  value: props.initialValue,
  editedByUser: false,
  copied: false,
  userIsTyping: false,
  passwordIsVisible: false,
  loadingMesssage: "",
  isEditable: !props.initialValue,
  isMenuOpen: false,
  lockStatus: "",
  numberLockingToolTipText: "",
});

const cloak = computed(() => store.getters.getCloak);

const warningMessage = computed(() => {
  if (props.field !== "phone") {
    return null;
  }

  const shouldReplaceNumber = get(cloak.value, "replace_number");
  if (shouldReplaceNumber) {
    return `Cloaked numbers may not work on this site.  We are working on a permanent fix.  Cloak your remaining credentials, and stay secure.`;
  }

  return null;
});

const isTouchDevice = computed(() => navigator.maxTouchPoints > 0);

const inputType = computed(() => {
  if (
    (props.field === "password" || props.isSensitive) &&
    !state.passwordIsVisible
  ) {
    return "password";
  }

  return "text";
});

const label = computed(() => {
  if (props.fieldLabel) {
    return props.fieldLabel;
  }

  if (!props.field) {
    return "";
  }

  return [
    props.field[0].toUpperCase(),
    props.field.slice(1).toLowerCase(),
  ].join("");
});

const showEditOption = computed(() =>
  [
    props.fieldType !== "cloaked",
    props.field !== "notes",
    props.field !== "one-time passcode",
  ].every(Boolean)
);

const showGenerateOption = computed(() => {
  if (props.field === "one-time passcode") {
    return false;
  }
  if (props.field === "phone" && props.fieldType !== "cloaked") {
    return true;
  }
  if (props.field === "phone" && props.fieldType === "cloaked") {
    return false;
  }
  if (props.field === "email" && props.fieldType !== "cloaked") {
    return true;
  }
  if (props.field === "email" && props.fieldType === "cloaked") {
    return false;
  }
  if (props.field === "notes") {
    return false;
  }
  if (props.field === "website") {
    return false;
  } else {
    return true;
  }
});

const showGenerateButton = computed(() =>
  [
    !state.userIsTyping,
    !props.loading,
    props.field !== "notes",
    props.field !== "website",
    props.field !== "one-time passcode",
    !props.initialValue,
  ].every(Boolean)
);

const showLinkOutButton = computed(
  () => props.field === "website" && props.initialValue
);

const isAutofill = computed(
  () => ["username", "notes"].includes(props.field) || state.editedByUser
);

const isDisabled = computed(() => {
  if (props.readOnly) {
    return true;
  }
  if (props.field === "notes" && !props.isOnSharedPage) {
    return false;
  }
  if (props.field === "one-time passcode") {
    return false;
  }
  return props.fieldType === "cloaked" || !state.isEditable;
});

const showCopyTooltip = computed(() => {
  if (props.isOnSharedPage) {
    return true;
  } else if (props.field === "notes") {
    return false;
  } else if (state.isDisabled) {
    return false;
  } else if (state.isEditable) {
    return false;
  } else if (!state.value) {
    return false;
  } else {
    return true;
  }
});

const tooltipMessage = computed(() => {
  let message = isTouchDevice.value ? "Copied" : "Click to copy";

  if (state.copied) {
    message = "Copied";
  }
  return showCopyTooltip.value ? message : "";
});

const showPasswordRevealButton = computed(
  () => (props.field === "password" || props.isSensitive) && state.value
);

const showLockIcon = computed(
  () =>
    !!(
      props.fieldType === "cloaked" &&
      props.field === "phone" &&
      state.lockStatus
    )
);

watch(
  () => props.initialValue,
  (newInitialValue) => {
    state.value = newInitialValue;
    state.editedByUser = false;

    if (!newInitialValue) {
      state.isEditable = true;
    } else {
      state.isEditable = false;
    }
  },
  { deep: true }
);

watch(
  () => props.phoneObject,
  (val) => {
    state.lockStatus = val?.state;
    state.numberLockingToolTipText = tooltipFormatter(val);
  },
  { deep: true }
);

watch(
  () => props.error,
  () => {
    if (!props.error) {
      return;
    }
    state.value = props.initialValue;
    state.editedByUser = false;
    if (!props.initialValue) {
      state.isEditable = true;
    } else {
      state.isEditable = false;
    }
  },
  { deep: true }
);
watch(
  () => props.forceReset,
  (shouldReset) => {
    if (shouldReset) {
      state.value = props.initialValue;
    }
  },
  { deep: true }
);
watch(
  () => props.forceReset,
  (newCloak, oldCloak) => {
    if (newCloak.id !== oldCloak.id) {
      state.value = props.initialValue;
    }
  },
  { deep: true }
);

const tooltipFormatter = (value) => {
  if (value?.state === "pending_lock" && value?.locks_at) {
    const relativeDate = getRelativeTime(value?.locks_at);
    if (relativeDate) {
      return `This number will lock permanently ${relativeDate}`;
    }
    const date = moment(value?.locks_at).format("MMM Do, y");
    return `This number will lock permanently on ${date}`;
  }
  return value?.state ? LOCK_TOOLTIP_TEXT[value?.state] : "";
};

const handleClickInputWrapper = (event) => {
  if (props.initialValue) {
    event.preventDefault();
    state.copied = true;
    return copy();
  }

  return focus();
};
const updateNumberLockingUserFlag = () => {
  UserService.setFlag({
    name: HAS_SEEN_LOCKED_NUMBERS_WARNING,
    value: true,
  });
};
const handleNumberLockingApiCall = async () => {
  try {
    if (state.lockStatus === "pending_lock") {
      const res = await NumberLockingService.unlockPhoneNumber(
        props.phoneObject.id
      );
      toast.success(`Your number for ${props.nickname} has been unlocked`);
      state.lockStatus = res.data.state;
      state.numberLockingToolTipText = tooltipFormatter(res.data);
      return;
    } else if (
      state.lockStatus === "open" ||
      state.lockStatus === "pending_expiration"
    ) {
      const res = await NumberLockingService.lockPhoneNumber(
        props.phoneObject.id
      );
      toast.success(`Your number for ${props.nickname} has been locked`);
      state.lockStatus = res.data.state;
      state.numberLockingToolTipText = tooltipFormatter(res.data);
    }
  } catch (e) {
    toast.error(
      e.response?.data?.errors ||
        "Something went wrong, please try again later."
    );
  }
};
const handleNumberLockToggle = () => {
  // might need to be more like  store.getters["settings/getPhoneNumberRemaining"]
  if (!store.getters.getFlag(HAS_SEEN_LOCKED_NUMBERS_WARNING)) {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(NumberLockingWarningModal),
        props: {
          setPrimary: true,
          mode: state.lockStatus,
        },
        events: {
          "hide-warning": updateNumberLockingUserFlag,
          "continue-number-lock": handleNumberLockingApiCall,
        },
      },
    });
    return;
  }
  handleNumberLockingApiCall();
};
const focus = () => {
  inputRow?.value?.focus();
};
const handleInput = (value) => {
  state.value = value;
  if (value) {
    state.userIsTyping = true;
  } else {
    state.userIsTyping = false;
  }

  if (!state.editedByUser) {
    state.editedByUser = true;
  }

  emit("input", state.value);
};
const handleEnterPress = (event) => {
  if (props.disableEnter) {
    return;
  }

  if (props.enterCtrl && !event.ctrlKey && !event.metaKey) {
    return;
  }

  triggerInputBlur();
};
const triggerInputBlur = () => {
  if (inputRow?.value) {
    inputRow?.value.blur();
  }
};
const save = () => {
  state.loadingMesssage = `Updating ${props.field}...`;

  if (state.value !== props.initialValue) {
    emit("save", state.value, isAutofill.value);
  }
};
const copy = () => {
  tools.copyToClipboard(props.copyValue || state.value);
  emit("copied");
  posthogCapture("user_copied_identifier", {
    identifier: props.field,
  });
  if (props.identityId) {
    IdentityService.patchIdentityUpdatedAt(props.identityId);
  }
};

const deleteModalParagraphCopy = computed(() => {
  if (["one-time passcode", "username", "password"].includes(props.field)) {
    return "You will not be able to recover it.";
  }
  if (props.field === "notes") {
    return "You will not be able to recover the contents of this note.";
  }
  return `Deleting this cloak generated ${props.field} will lose all the inbox messages related to that identifier.`;
});

const showDeleteModal = () => {
  if (props.forceDelete) {
    return emit("delete");
  }
  state.loadingMesssage = `Deleting ${props.field}...`;
  const fieldSingular =
    props.field[props.field.length - 1] === "s"
      ? props.field.slice(0, props.field.length - 1)
      : props.field;
  store.dispatch("openGlobalDeleteModal", {
    type: fieldSingular,
    paragraphs: [deleteModalParagraphCopy.value],

    onClick: () => emit("delete"),
  });
};
const regenerate = () => {
  emit("generate");
  state.loadingMesssage = `Generating ${props.field}...`;
};
const handleFocus = () => {
  emit("focus");
};

const handleBlur = () => {
  state.passwordIsVisible = false;
  state.userIsTyping = false;

  emit("blur");
  save();
};
const handleMouseLeave = () => {
  setTimeout(() => {
    nextTick().then(() => {
      state.copied = false;
    });
  }, 200);
};

const handlePasswordReveal = () => {
  state.passwordIsVisible = !state.passwordIsVisible;
};
const handleEditButton = () => {
  state.isEditable = true;
  state.passwordIsVisible = true;
  nextTick().then(() => {
    focus();
  });
};
const showCopyOption = ref(true);
onBeforeMount(() => {
  /* Only show the copy tooltip on totp if we can generate one */
  if (props.field === "one-time passcode" && props.initialValue) {
    try {
      const totpToken = props.initialValue.startsWith("otpauth://")
        ? URI.parse(props.initialValue)
        : new TOTP({
            algorithm: undefined,
            digits: undefined,
            issuer: undefined,
            label: undefined,
            period: undefined,
            secret: props.initialValue,
          });

      totpToken.generate();
      showCopyOption.value = true;
    } catch {
      showCopyOption.value = false;
    }
  }
});
</script>
<template>
  <CloakDetailsInputRow
    ref="inputRow"
    :value="state.value"
    :label="label"
    :loading="props.loading"
    :placeholder="props.placeholder"
    :disabled="isDisabled"
    :error="props.error"
    :type="inputType"
    :loading-message="state.loadingMesssage"
    :textarea="props.field === 'notes'"
    :tooltip-message="tooltipMessage"
    :show-copy-tooltip="showCopyOption"
    :warning="!!warningMessage"
    :warning-tooltip-message="warningMessage"
    :aria-id="`CloakedDetail${label || ''}Row`"
    :maxlength="props.field === 'password' ? 128 : undefined"
    :is-menu-open="state.isMenuOpen"
    :is-on-shared-page="props.isOnSharedPage"
    :is-editable="state.isEditable"
    :number-locking-tool-tip-text="state.numberLockingToolTipText"
    :show-lock-icon="showLockIcon"
    @mouseleave="handleMouseLeave"
    @click-input-wrapper="handleClickInputWrapper"
    @keydown.enter="handleEnterPress"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    @save="save"
  >
    <template #input-before>
      <slot name="input-before" />
    </template>

    <template #input="slotProps">
      <slot
        name="input"
        v-bind="slotProps"
      />
    </template>

    <template #tooltip>
      <slot name="tooltip" />
    </template>

    <template #icon>
      <InlineSvg
        v-if="props.readOnly"
        name="lock"
      />
      <CloakIdentifierIcon
        v-else-if="state.value && state.value.length"
        :field="props.field"
        :field-type="props.fieldType"
      />
      <InlineSvg
        v-else
        name="plus"
      />
    </template>

    <template #numberLocking>
      <CloakInfoRowButton
        :disabled="
          state.lockStatus === 'locked' || state.lockStatus === 'expired'
        "
        color-override
        icon
        @click="handleNumberLockToggle"
      >
        <InlineSvg
          v-if="
            state.lockStatus === 'open' ||
            state.lockStatus === 'pending_expiration'
          "
          name="open-lock"
        />
        <InlineSvg
          v-else-if="state.lockStatus === 'pending_lock'"
          name="lock"
        />
        <InlineSvg
          v-else-if="state.lockStatus === 'locked'"
          name="permalock"
        />
      </CloakInfoRowButton>
    </template>

    <template
      v-if="!props.readOnly"
      #actions
    >
      <CloakInfoRowButton
        v-if="showPasswordRevealButton"
        aria-id="ShowPasswordButton"
        icon
        @click.stop="handlePasswordReveal"
      >
        <InlineSvg
          v-if="state.passwordIsVisible"
          name="eye"
        />
        <InlineSvg
          v-else
          name="eye-slash"
        />
      </CloakInfoRowButton>

      <CloakInfoRowButton
        v-if="showLinkOutButton"
        icon
        :href="props.initialValue"
        @click.stop="() => {}"
      >
        <InlineSvg name="link" />
      </CloakInfoRowButton>

      <CloakInfoRowButton
        v-if="showGenerateButton"
        aria-id="GenerateButton"
        @click.stop="regenerate()"
      >
        Generate
      </CloakInfoRowButton>

      <UiMenu
        v-else-if="!!state.value && !props.isOnSharedPage"
        width="188px"
        placement="bottom-end"
        :value="state.isMenuOpen"
        @input="(event) => (state.isMenuOpen = event)"
      >
        <CloakInfoRowButton
          :aria-id="`Menu.${props.field || ''}Button`"
          icon
          :active="state.isMenuOpen"
        >
          <InlineSvg name="kabob" />
        </CloakInfoRowButton>

        <template #content>
          <UiMenuButton
            v-if="showEditOption"
            :aria-id="`Edit.${label || ''}Button`"
            title="Edit"
            @click="handleEditButton()"
          >
            <template #icon>
              <InlineSvg name="edit-pencil-larger" />
            </template>
          </UiMenuButton>

          <UiMenuButton
            v-if="showGenerateOption"
            :aria-id="`Regenerate.${label || ''}Button`"
            title="Generate new"
            @click="regenerate()"
          >
            <template #icon>
              <InlineSvg
                name="generate"
                style="width: auto; height: auto"
              />
            </template>
          </UiMenuButton>

          <UiMenuButton
            v-if="showCopyOption"
            title="Copy"
            :aria-id="`Copy.${props.field || ''}Button`"
            @click="copy()"
          >
            <template #icon>
              <InlineSvg name="copy" />
            </template>
          </UiMenuButton>

          <UiMenuSeparator v-if="showCopyOption" />

          <UiMenuButton
            v-if="!props.transactionNote"
            title="Delete"
            :aria-id="`Delete.${props.field || ''}Button`"
            @click="showDeleteModal()"
          >
            <template #icon>
              <InlineSvg
                name="delete-trash"
                height="15px"
                width="15px"
              />
            </template>
          </UiMenuButton>
        </template>
      </UiMenu>
    </template>
  </CloakDetailsInputRow>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.breached {
  background-color: red;
}
</style>
