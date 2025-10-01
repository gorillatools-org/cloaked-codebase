<script setup>
import { computed, nextTick, reactive, ref, useSlots, watch } from "vue";
import InputSpinner from "@/features/InputSpinner.vue";
import CloakIdentifierIcon from "@/features/cloakDetails/CloakIdentifierIcon.vue";
import Button from "@/features/Button.vue";
import store from "@/store";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import { vOnClickOutside } from "@vueuse/components";
import { useToast } from "@/composables/useToast.js";
import InlineSvg from "@/features/InlineSvg.vue";

const toast = useToast();

const emit = defineEmits([
  "focus",
  "blur",
  "click-input-wrapper",
  "save",
  "input",
]);

const slots = useSlots();

const props = defineProps({
  value: { type: [String, Number], default: null },
  label: { type: String, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  highlighted: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingMessage: { type: String, default: "" },
  textarea: { type: Boolean, default: false },
  tooltipMessage: { type: String, default: "" },
  showCopyTooltip: { type: Boolean, default: true },
  warning: { type: Boolean, default: false },
  warningTooltipMessage: { type: String, default: "" },
  maxlength: { type: Number, required: false, default: 10000 },
  isMenuOpen: { type: Boolean, default: false },
  isEditable: { type: Boolean, default: false },
  isOnSharedPage: { type: Boolean, default: false },
  showLockIcon: { type: Boolean, default: false },
  numberLockingToolTipText: { type: String, default: "" },
});

const state = reactive({
  isFocused: false,
  minTextareaRows: 10,
  maxTextareaRows: Infinity,
  textareaRows: 10,
  dirty: false,
  notes: props.textarea ? props.value : "",
});

const inputField = ref(null);
const textareaGhost = ref(null);

const textAreaGhostLines = computed(() => {
  if (!props.textarea) {
    return [];
  }

  const lines = props.value.split("\n");

  return lines;
});

const notesValueChanged = computed(() => {
  if (props.textarea) {
    return state.notes !== props.value;
  }
  return null;
});

watch(
  () => props.value,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      state.dirty = true;
      if (props.textarea) {
        state.notes = newValue;
      }
    }
    adjustTextareaHeight();
  },
  { deep: true }
);

const focus = () => {
  if (inputField?.value) {
    inputField?.value?.focus();
  }
};

const blur = () => {
  if (inputField?.value) {
    inputField?.value?.blur();
  }
};

defineExpose({
  focus,
  blur,
});

const handleFocus = (e) => {
  state.isFocused = true;
  emit("focus", e);
};

const handleBlur = (e) => {
  if (e.srcElement.title === "Edit") {
    state.isFocused = true;
    return;
  } else if (state.isFocused) {
    state.isFocused = false;
    if (props.textarea && notesValueChanged?.value) {
      store.dispatch("openModal", {
        header: `You have unsaved changes`,
        subheader:
          "You have made changes to your notes that you did not save. Do you want to save your changes?",
        button: {
          text: "Yes, Save",
          onClick: saveNotes,
        },
        cancelText: "Discard Changes",
        cancelAction: () => {
          updateNotes(props.value);
          emit("blur");
        },
      });
    } else if (state.dirty) {
      emit("blur", e);
    }
  }
};

const handleClickInputWrapper = (e) => {
  if (state.isFocused) {
    e.stopPropagation();
    return;
  }

  emit("click-input-wrapper", e);
};

const adjustTextareaHeight = () => {
  if (!props.textarea) {
    return;
  }

  nextTick().then(() => {
    const node = inputField?.value;
    const ghost = textareaGhost?.value;

    if (!node) {
      return;
    }

    const nodeStyle = window.getComputedStyle(node);
    let lineHeight = nodeStyle.getPropertyValue("line-height");
    lineHeight = Number(lineHeight.replace(/\D/gi, ""));

    // fallback value even though I'm sure it won't reach this
    if (!Number.isFinite(lineHeight)) {
      lineHeight = 20;
    }

    if (ghost.scrollHeight) {
      state.textareaRows = Math.ceil(ghost.scrollHeight / lineHeight);

      if (state.textareaRows > state.maxTextareaRows) {
        state.textareaRows = state.maxTextareaRows;
      }

      if (state.textareaRows < state.minTextareaRows) {
        state.textareaRows = state.minTextareaRows;
      }
    } else {
      state.textareaRows = state.minTextareaRows;
    }
  });
};

function updateNotes(newTextValue) {
  state.notes = newTextValue;
}

function saveNotes() {
  emit("input", state.notes);
  setTimeout(() => {
    emit("blur");
    toast.success("Notes saved");
  }, 500);
}
</script>
<template>
  <div
    v-on-click-outside="handleBlur"
    class="cloak-details-input-row"
    :class="{
      'cloak-details-input-row--error': props.error,
      'cloak-details-input-row--has-value': !!props.value,
      'cloak-details-input-row--warning': props.warning,
      'cloak-details-input-row--is-disabled': props.disabled,
      'cloak-details-input-row--is-focused': state.isFocused,
      'cloak-details-input-row--is-highlighted': props.highlighted,
      'cloak-details-input-row--is-textarea': props.textarea,
      'cloak-details-input-row--menu-open': props.isMenuOpen,
      'cloak-details-input-row--has-tooltip': slots.tooltip,
    }"
  >
    <div class="cloak-details-input-row__label">
      {{ props.label }}
    </div>

    <div
      :aria-id="`CloakedDetail${props.label || ''}RowWrapper`"
      class="cloak-details-input-row__input-wrapper"
      @click="handleClickInputWrapper"
    >
      <slot name="input-before" />

      <div class="cloak-details-input-row__icon">
        <InputSpinner v-if="props.loading" />

        <UiTooltip
          v-else-if="props.warning"
          :title="props.warningTooltipMessage"
          width="192"
          align-x="center"
          position="top"
        >
          <InlineSvg name="icon-warning" />
        </UiTooltip>

        <slot
          v-else
          name="icon"
        />
      </div>

      <UiTooltip
        :title="props.showCopyTooltip ? props.tooltipMessage : ''"
        class="cloak-details-input-row__input"
        align-x="center"
        :is-on-shared-page="props.isOnSharedPage"
      >
        <div
          v-if="props.loading"
          class="cloak-details-input-row__loading-message"
        >
          <span>{{ props.loadingMessage }}</span>
        </div>

        <slot
          v-else
          name="input"
          :is-editable="props.isEditable"
        >
          <CloakIdentifierIcon
            :field-type="'cloaked'"
            :locked="true"
          />
          <div
            v-if="props.textarea"
            class="textarea-wrapper"
          >
            <textarea
              ref="inputField"
              autocomplete="off"
              :maxlength="props.maxlength"
              data-lpignore="true"
              :value="state.notes"
              :rows="state.textareaRows"
              :placeholder="props.placeholder"
              :disabled="props.disabled"
              :aria-id="`Add${props.label || ''}Input`"
              @input="(e) => updateNotes(e.target.value)"
              @keydown.enter.stop
              @focus="handleFocus"
            />
            <div class="textarea-actions">
              <div
                v-if="notesValueChanged"
                class="buttons"
              >
                <Button
                  type="secondary"
                  @click="updateNotes(props.value)"
                >
                  Cancel
                </Button>
                <Button
                  :loading="props.loading"
                  :disabled="props.loading"
                  @click="saveNotes"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>

          <input
            v-else
            ref="inputField"
            autocomplete="new-password"
            data-lpignore="true"
            data-form-type="other"
            style="width: 100%"
            :maxlength="props.maxlength"
            :value="props.value"
            :type="props.type"
            :placeholder="props.placeholder"
            :disabled="props.disabled"
            :aria-id="`Add${props.label || ''}Input`"
            @input="(e) => emit('input', e.target.value)"
            @focus="handleFocus"
            @keydown.enter="$emit('save')"
          />

          <div
            v-if="props.textarea && !props.loading"
            ref="textareaGhost"
            class="cloak-details-input-row__textarea-ghost"
          >
            <div
              v-for="(line, lineIndex) in textAreaGhostLines"
              :key="lineIndex"
              v-text="line"
            />
          </div>
        </slot>

        <template
          v-if="slots.tooltip"
          #content
        >
          <slot name="tooltip" />
        </template>
      </UiTooltip>

      <UiTooltip
        v-if="props.showLockIcon"
        :title="props.numberLockingToolTipText"
        align-x="center"
        :is-on-shared-page="false"
        max-width="255"
      >
        <slot name="numberLocking" />
      </UiTooltip>
      <div
        v-if="props.textarea ? !notesValueChanged : true"
        class="cloak-details-input-row__actions"
      >
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.cloak-details-input-row {
  --input-wrapper-background: none;
  --input-wrapper-color: $color-primary-50;
  --input-wrapper-border-color: $color-primary-1;
  --input-wrapper-box-shadow: none;
  --input-icon-color: currentcolor;
  --actions-display: flex;
  --actions-visibility: hidden;
  --input-height: 44px;

  display: flex;
  align-items: center;
  gap: 4px;

  &--error {
    .cloak-details-input-row__input-wrapper {
      border-color: $color-alert !important;
    }

    input {
      &:focus {
        --inner-border-color: $color-alert;
      }
    }
  }

  &__label {
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-50;
    width: 80px;
    flex-shrink: 0;
  }

  &__input-wrapper {
    padding: 0 4px 0 10px;
    border-radius: 20px;
    height: var(--input-height);
    display: flex;
    align-items: center;
    gap: 6px;
    color: $color-primary-1;
    background: var(--input-wrapper-background);
    flex: 1 1 0;
    border: 1px solid transparent;
    box-sizing: border-box;
    box-shadow: var(--input-wrapper-box-shadow);
    overflow: hidden;
    position: relative;

    @at-root .cloak-details-input-row--menu-open &,
      &:hover {
      --actions-display: flex;
      --actions-visibility: visible;

      border: 1px solid $color-primary-10;
      color: $color-primary-100;
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: $color-primary-100;

    svg {
      min-width: 12px;
      min-height: 12px;
      max-width: 18px;
      max-height: 18px;
      color: $color-primary-100;
    }
  }

  &__loading-message {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-70;
    font-weight: 400;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__input {
    font-weight: 400;
    color: $color-primary-1;
    flex: 1 1 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 10px 0;
    position: relative;

    input {
      height: 24px;
    }

    input,
    textarea {
      border: 0;
      outline: none;
      background: none;
      padding: 0;
      font-size: 12px;
      line-height: 18px;
      color: $color-primary-100;
      text-overflow: ellipsis;

      &[disabled] {
        pointer-events: none;
      }
    }

    textarea {
      font-family: $global-font;
      resize: none;
      padding-right: 0;
      width: 100%;
      overflow: hidden;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  &__textarea-ghost {
    position: fixed;
    z-index: -1;
    left: 0;
    top: 0;
    width: 100%;
    max-height: 100%;
    font-size: 12px;
    line-height: 18px;
    padding: 0;
    visibility: hidden;

    div {
      height: 18px;
      min-width: 1ch;
    }
  }

  &__actions {
    position: relative;
    align-items: center;
    flex-shrink: 0;
    display: var(--actions-display);
    visibility: var(--actions-visibility);
    max-height: 30px;

    svg {
      color: $color-primary-100;
    }
  }

  &__number-locking {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;

    svg {
      color: $color-primary-100;
    }
  }

  &--has-value {
    --input-wrapper-color: $color-primary-100;
  }

  &--highlighted:not(&--is-focused) {
    --input-wrapper-background: $color-primary-1;
  }

  &--is-textarea {
    --actions-display: flex;
    --actions-visibility: hidden;

    .cloak-details-input-row {
      &__input-wrapper {
        height: unset;
        min-height: var(--input-height);

        &:hover {
          --actions-visibility: visible;
        }
      }

      &__label {
        min-height: var(--input-height);
        align-self: flex-start;
        display: flex;
        align-items: center;
      }

      &__icon {
        height: 38px;
        align-self: flex-start;
        padding: 0;
      }

      &__actions {
        align-self: flex-start;
        min-height: var(--input-height);
      }
    }
  }

  &--has-tooltip {
    .cloak-details-input-row__input,
    input {
      &:hover {
        cursor: pointer;
      }
    }
  }

  &--warning {
    --input-icon-color: $color-alert;
    --input-wrapper-color: $color-alert;

    &.cloak-details-input-row--is-focused {
      --input-wrapper-border-color: $color-alert;
    }
  }

  &--is-focused {
    .cloak-details-input-row__input-wrapper {
      border: 1px solid $color-primary-10;
    }
  }

  &:not(&--is-focused) {
    &:hover {
      &__input {
        background: $color-primary-10;
      }
    }
  }
}

.textarea-wrapper {
  width: 100%;
  padding-bottom: 50px;

  .textarea-actions {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    width: 100%;
    position: relative;
    overflow: visible;
    right: 5px;
    bottom: -50px;
    z-index: 10;

    .buttons {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: flex-end;
      position: absolute;
      gap: 10px;
      overflow: visible;
      width: auto;
    }
  }
}
</style>
