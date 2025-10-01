<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";

defineOptions({ inheritAttrs: false });

interface Props {
  title: string;
  error?: string;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
}

withDefaults(defineProps<Props>(), {
  error: undefined,
  rows: 4,
  placeholder: undefined,
  disabled: false,
  readonly: false,
});

const model = defineModel<string>();
</script>

<template>
  <label
    class="base-textarea"
    :class="$attrs.class as string"
    :style="$attrs.style as any"
  >
    <BaseText
      as="span"
      variant="body-small-medium"
      class="base-textarea__title"
    >
      {{ title }}
    </BaseText>
    <textarea
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      class="base-textarea__textarea"
      :class="{ 'base-textarea__textarea--error': error }"
      v-bind="{ ...$attrs, class: null, style: null }"
    />
    <slot
      name="after"
      :error="error"
    >
      <BaseInputFeedback
        v-if="error"
        :message="error"
        variant="error"
        class="base-textarea__feedback"
      />
    </slot>
  </label>
</template>

<style scoped lang="scss">
@import "@/assets/scss/recursive/library";

.base-textarea {
  display: grid;
  gap: 4px;
  grid-template-columns: 1fr;
  grid-template-areas: "title" "textarea" "feedback";

  &__title {
    grid-area: title;
    color: $color-primary-50;
  }

  &__textarea {
    @include font-style-by-type("body-2-semibold");

    padding: 16px;
    border-radius: 16px;
    min-height: 100px;
    grid-area: textarea;
    background-color: $color-primary-1;
    color: $color-primary-100;
    border: 1px solid $color-primary-30;
    box-shadow: 0 5px 20px 0 rgba($black, 5%);
    resize: none;
    font-family: inherit;
    line-height: 1.5;

    @media all and (min-width: $screen-md) {
      border-radius: 12px;
    }

    &::placeholder {
      @include font-style-by-type("body-2-semibold");

      color: $color-primary-20;
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
      resize: none;
    }

    &[readonly] {
      border-color: rgba($black, 0.05);
      background-color: $color-primary-5;
      box-shadow: none;
      color: $color-primary-50;
      cursor: default;
      resize: none;

      &:focus {
        border-color: rgba($black, 0.05);
        background-color: $color-primary-5;
        box-shadow: none;
      }
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

  &__feedback {
    grid-area: feedback;
  }
}
</style>
