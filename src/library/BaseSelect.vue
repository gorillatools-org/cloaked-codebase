<script setup>
import BaseText from "@/library/BaseText.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import BaseIcon from "@/library/BaseIcon.vue";

defineOptions({ inheritAttrs: false });

defineProps({
  title: {
    type: String,
    required: true,
  },
  requiredMark: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    default: () => [],
  },
  error: {
    type: String,
    default: null,
  },
});

const model = defineModel({ type: String });
</script>

<template>
  <label
    class="base-select"
    :class="$attrs.class"
    :style="$attrs.style"
  >
    <BaseText
      as="span"
      variant="body-small-medium"
      class="base-select__title"
    >
      <span>
        {{ title }}
        <span
          v-if="requiredMark"
          class="base-select__required-mark"
        >
          *
        </span>
      </span>
    </BaseText>
    <select
      v-model="model"
      class="base-select__select"
      :class="{ 'base-select__select--error': error }"
      v-bind="{ ...$attrs, class: null, style: null }"
    >
      <option
        value=""
        class="base-select__option"
        disabled
        hidden
      >
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        class="base-select__option"
      >
        {{ option.label }}
      </option>
    </select>
    <div
      v-if="$slots.left"
      class="base-select__addon-left"
    >
      <slot name="left" />
    </div>
    <div
      v-if="$slots.right"
      class="base-select__addon-right"
    >
      <slot name="right" />
    </div>
    <BaseIcon
      name="chevron-down"
      class="base-select__chevron"
    />
    <slot
      name="after"
      :error="error"
    >
      <BaseInputFeedback
        v-if="error"
        :message="error"
        variant="error"
        class="base-select__feedback"
      />
    </slot>
  </label>
</template>

<style scoped lang="scss">
@import "@/assets/scss/recursive/library";

.base-select {
  display: grid;
  gap: 4px 0;
  grid-template-columns: 1fr max-content;
  grid-template-areas: "title title" "field field";

  &__title {
    grid-area: title;
    color: $color-primary-50;
  }

  &__required-mark {
    color: $color-status-error;
  }

  &__select {
    @include font-style-by-type("body-2-semibold");

    padding: 0 calc(16px + 24px + 8px) 0 16px;
    border-radius: 16px;
    height: 64px;
    grid-area: field;
    background-color: $color-primary-1;
    color: $color-primary-20;
    border: 1px solid rgba($black, 0.2);
    cursor: pointer;
    appearance: none;
    box-shadow: 0 5px 20px 0 rgba($black, 5%);

    @media all and (min-width: $screen-md) {
      height: 48px;
      border-radius: 12px;
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

    &:has(.base-select__addon-left) {
      padding-left: 34px;
    }

    &:has(.base-select__addon-right) {
      padding-right: calc(16px + (24px + 8px) + (24px + 8px));
    }

    &:has(.base-select__option:not([value=""]):checked) {
      color: $color-primary-100;
    }

    &--error {
      border-color: $color-alert;

      &:hover,
      &:active,
      &:focus {
        border-color: $color-alert;
      }
    }
  }

  &__option {
    @include font-style-by-type("body-2-semibold");
  }

  &__chevron {
    grid-area: field;
    place-self: center end;
    display: grid;
    margin-right: 16px;
    pointer-events: none;
    font-size: 19px;
  }

  &__feedback {
    grid-column: 1/5;
  }

  &__addon-left {
    grid-area: field;
    place-self: center start;
    margin-left: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  &__addon-right {
    grid-area: field;
    place-self: center end;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: calc(16px + 24px + 8px); // leave space for chevron
  }
}
</style>
