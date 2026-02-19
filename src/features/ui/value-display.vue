<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";

import { computed, useSlots } from "vue";
const slots = useSlots();

const emit = defineEmits(["delete", "edit", "add", "click"]);

const props = defineProps({
  value: { type: [String, Number], default: null },
  label: { type: String, default: null },
  disabled: Boolean,
  readonly: Boolean,
  arrow: Boolean,
  xIcon: Boolean,
  danger: Boolean,
  edit: Boolean,
  add: Boolean,
  darkLabel: Boolean,
  lightValue: Boolean,
  noSeparator: Boolean,
  onDelete: { type: Function, default: null },
  onEdit: { type: Function, default: null },
  onAdd: { type: Function, default: null },
  onClick: { type: Function, default: null },
});

function handleDelete($event) {
  $event.stopPropagation();
  emit("delete");
}

function handleEdit($event) {
  $event.stopPropagation();
  emit("edit");
}

function handleAdd($event) {
  $event.stopPropagation();
  emit("add");
}

const shouldCapitalize = computed(() => {
  return (
    props.label &&
    !(
      props.label.toLowerCase().includes("email") ||
      props.label.toLowerCase().includes("forward")
    )
  );
});
</script>

<template>
  <div
    class="value-display-wrapper"
    :class="{
      'value-display-wrapper--clickable': !!props.onClick,
    }"
  >
    <div
      class="value-display"
      :class="{
        'value-display--dark-label': props.darkLabel,
        'value-display--light-value': props.lightValue,
        'value-display--disabled': props.disabled,
        'value-display--readonly': props.readonly,
        'value-display--danger': props.danger,
        'value-display--no-separator': props.noSeparator,
        'value-display--delete': !!props.onDelete,
        'value-display--edit': !!props.onEdit,
      }"
      @click="$emit('click')"
    >
      <div
        v-if="!!slots['pre-field']"
        class="value-display__pre-field"
      >
        <slot name="pre-field" />
      </div>

      <div class="value-display__field">
        <div class="value-display__label">
          <BaseText
            variant="body-2-semibold"
            style="display: inline-flex; align-items: center"
          >
            {{ props.label }}
            <span
              v-if="!!slots['icon-label']"
              class="icon-label"
            >
              <slot name="icon-label" />
            </span>
          </BaseText>
        </div>

        <BaseText
          v-if="props.value"
          as="div"
          variant="body-2-semibold"
          class="value-display__value"
          :class="{
            'value-display__capitalize': shouldCapitalize,
          }"
        >
          {{ props.value }}
        </BaseText>
      </div>

      <div class="value-display__actions">
        <slot name="actions">
          <button
            v-if="!!props.onEdit"
            class="value-display__action-button value-display__action-button--edit"
            @click="handleEdit"
          >
            <InlineSvg name="edit-pencil-larger" />
          </button>
          <button
            v-if="!!props.onAdd"
            class="value-display__action-button value-display__action-button--add"
            @click="handleAdd"
          >
            <InlineSvg name="plus" />
          </button>
          <button
            v-if="!!props.onDelete"
            class="value-display__action-button value-display__action-button--delete"
            @click="handleDelete"
          >
            <InlineSvg
              v-if="props.xIcon"
              name="close-modal-full"
              style="width: auto"
            />
            <InlineSvg
              v-else
              name="trash-outline"
            />
          </button>
          <button
            v-else-if="(!!props.onClick && !props.onAdd) || props.arrow"
            class="value-display__action-button"
          >
            <InlineSvg name="chevron-right" />
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.value-display-wrapper {
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  border-radius: 8px;
  width: calc(100% + 16px);
  margin-left: -8px;

  &.add-margin {
    margin-top: 20px;
  }

  &--clickable {
    &:hover {
      cursor: pointer;
      transform: scale(1.005);
      background: $color-primary-5;
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    }
  }
}

.value-display {
  display: flex;
  position: relative;
  min-height: 60px;
  width: 100%;
  border-bottom: 1px solid $color-primary-10;

  --label-color: $color-primary-70;
  --value-color: $color-primary-100;

  color: $color-primary-100;
  padding: 8px;
  box-shadow: none;
  gap: 8px;

  &__pre-field {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__field {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__capitalize {
    text-transform: capitalize;
  }

  &__label,
  &__value {
    min-height: 21px;
    display: flex;
    align-items: center;
    overflow: hidden;

    span {
      text-overflow: ellipsis;
    }
  }

  &__label {
    color: $color-primary-70;
    flex: 1 0 0;

    .icon-label {
      > svg {
        margin-left: 8px;
        margin-right: 4px;
        margin-bottom: -1px;
      }
    }
  }

  &__value {
    color: $color-primary-100;
  }

  &__actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__action-button {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: $color-primary-100;
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

    &--delete {
      cursor: pointer;

      svg {
        width: 15px;
        height: auto;
      }

      &:hover {
        color: $color-alert;
        transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      }
    }

    svg {
      max-width: 100%;
    }

    &:hover {
      cursor: pointer;
    }
  }

  &--danger {
    --label-color: $color-alert;
  }

  &--dark-label {
    --label-color: $color-primary-100;
  }

  &--light-value {
    --value-color: $color-primary-70;
  }

  &--no-separator {
    border-bottom: none;
  }

  &--disabled {
    opacity: 0.3;
  }

  &--delete,
  &--edit,
  &--add {
    cursor: default;
  }

  &:not(&--disabled, &--readonly, &--delete, &--edit, &--add) {
    .value-display__action-button {
      &:hover {
        cursor: pointer;
      }
    }

    &:hover {
      cursor: pointer;
    }
  }
}
</style>
