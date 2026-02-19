<script setup>
import { ref, computed, useAttrs, useTemplateRef } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import BaseIcon from "@/library/BaseIcon.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  action: {
    type: [String, null],
    default: null,
  },
  secret: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [String, null],
    default: null,
  },
  requiredMark: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click-action"]);

const attrs = useAttrs();

const model = defineModel({
  type: String,
  default: "",
});

const inputRef = useTemplateRef("inputRef");

const isHidden = ref(true);

const inputType = computed(() => {
  if (props.secret && (isHidden.value || attrs.disabled)) {
    return "password";
  }
  return props.type || "text";
});

const secretIconName = computed(() => {
  return isHidden.value || attrs.disabled ? "eye-visible" : "eye-hidden";
});

const handleActionClick = () => {
  if (props.action) {
    emit("click-action", props.action);
  }
};

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  input: inputRef,
});
</script>

<template>
  <label
    class="base-input"
    :class="$attrs.class"
    :style="$attrs.style"
  >
    <BaseText
      as="span"
      variant="body-small-medium"
      class="base-input__title"
    >
      <span>
        {{ title }}
        <span
          v-if="requiredMark"
          class="base-input__required-mark"
        >
          *
        </span>
      </span>
      <slot name="label-after" />
    </BaseText>
    <input
      ref="inputRef"
      v-model="model"
      :type="inputType"
      class="base-input__input"
      :class="{ 'base-input__input--error': error }"
      v-bind="{ ...$attrs, class: null, style: null }"
    />
    <div
      v-if="$slots.left"
      class="base-input__addon-left"
    >
      <slot name="left" />
    </div>
    <div
      v-if="$slots.right"
      class="base-input__addon-right"
    >
      <slot name="right" />
    </div>
    <BaseIcon
      v-if="action"
      :name="action"
      class="base-input__action"
      :class="{ 'base-input__action--active': !!model }"
      @click="handleActionClick"
    />
    <BaseIcon
      v-if="secret"
      :name="secretIconName"
      class="base-input__action"
      :class="{ 'base-input__action--active': !!model }"
      @click="isHidden = !isHidden"
    />
    <slot
      name="after"
      :error="error"
    >
      <BaseInputFeedback
        v-if="error"
        :message="error"
        variant="error"
        class="base-input__feedback"
      />
    </slot>
  </label>
</template>

<style scoped lang="scss">
@import "@/assets/scss/recursive/library";

.base-input {
  display: grid;
  gap: 4px 8px;
  grid-template-columns: 1fr 24px 24px 24px 8px;
  grid-template-areas: "title title title title title" "input-start action-1 action-2 addon-right input-end";
  position: relative;

  &__title {
    display: flex;
    align-items: center;
    gap: 4px;
    grid-area: title;
    justify-content: space-between;
    color: $color-primary-50;
  }

  &__required-mark {
    color: $color-status-error;
  }

  &__input {
    @include font-style-by-type("body-2-semibold");

    padding: 0 16px;
    border-radius: 16px;
    height: 64px;
    grid-row: input-start;
    grid-column: input-start / input-end;
    background-color: $color-primary-1;
    color: $color-primary-100;
    border: 1px solid rgba($black, 0.2);
    box-shadow: 0 5px 20px 0 rgba($black, 5%);

    @media all and (min-width: $screen-md) {
      height: 48px;
      border-radius: 12px;
    }

    &::placeholder {
      @include font-style-by-type("body-2-semibold");

      color: $color-primary-20;
    }

    &:hover {
      border: 1px solid rgba($black, 0.4);
    }

    &:active,
    &:focus {
      outline: none;
      border-color: $color-primary-100;
      box-shadow: 0 10px 24px 0 rgb(0 0 0 / 15%);
      background-color: $color-primary-1;
    }

    &:disabled {
      border-color: rgba($black, 0.05);
      background-color: $color-primary-5;
      box-shadow: none;
      color: $color-primary-20;
      cursor: not-allowed;
    }

    &--error {
      border-color: $color-alert;

      &:hover,
      &:active,
      &:focus {
        border-color: $color-alert;
      }
    }

    &:has(~ .base-input__action:nth-of-type(1)) {
      padding-right: calc(16px + 1 * (24px + 8px));
    }

    &:has(~ .base-input__action:nth-of-type(2)) {
      padding-right: calc(16px + 2 * (24px + 8px));
    }
  }

  &__action {
    place-self: center;
    font-size: 19px;
    color: $color-primary-100;
    cursor: pointer;
    opacity: 0.3;

    &:nth-of-type(1) {
      grid-area: action-1;
    }

    &:nth-of-type(2),
    &:only-of-type {
      grid-area: action-2;
    }

    &--active {
      opacity: 1;
    }

    &:hover {
      opacity: 0.7;
    }

    @at-root .base-input:has(.base-input__input:disabled) & {
      color: $color-primary-20;
      cursor: not-allowed;
      opacity: 1;
    }
  }

  &__feedback {
    grid-column: 1/5;
  }

  &__addon-left {
    grid-row: input-start;
    grid-column: input-start / input-end;
    place-self: center start;
    margin-left: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
}

// When there is no right addon, collapse the grid back to the original 4 columns
.base-input:not(:has(.base-input__addon-right)) {
  grid-template-columns: 1fr 24px 24px 8px;
  grid-template-areas: "title title title title" "input-start action-1 action-2 input-end";
}

.base-input:has(.base-input__addon-left) .base-input__input {
  padding-left: 44px;
}

.base-input__addon-right {
  grid-area: addon-right;
  place-self: center center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

// When there is no right addon, keep original padding behavior
.base-input:not(:has(.base-input__addon-right)) .base-input__input {
  padding-right: 16px;
}

.base-input:has(.base-input__addon-right) .base-input__input {
  padding-right: calc(16px + 1 * (24px + 8px));
}

.base-input:not(:has(.base-input__addon-right))
  .base-input__input:has(~ .base-input__action:nth-of-type(1)) {
  padding-right: calc(16px + 1 * (24px + 8px));
}

.base-input:not(:has(.base-input__addon-right))
  .base-input__input:has(~ .base-input__action:nth-of-type(2)) {
  padding-right: calc(16px + 2 * (24px + 8px));
}

.base-input:has(.base-input__addon-right):has(
    .base-input__action:nth-of-type(2)
  )
  .base-input__input {
  padding-right: calc(16px + 3 * (24px + 8px));
}
</style>
