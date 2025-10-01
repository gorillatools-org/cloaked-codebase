<script setup>
import InputValidationError from "@/features/InputValidationError.vue";
import BaseText from "@/library/BaseText.vue";

defineProps({
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  errors: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["input", "keydown", "change", "click"]);
</script>

<template>
  <label
    class="bottom-border-input-text"
    :class="{ 'bottom-border-input-text--error': errors.length }"
  >
    <BaseText
      v-if="label"
      variant="headline-5-bold"
      class="bottom-border-input-text__label"
    >
      {{ label }}
    </BaseText>
    <span
      class="bottom-border-input-text__input-wrapper"
      @click="$emit('click')"
    >
      <input
        v-bind="$attrs"
        ref="input"
        class="bottom-border-input-text__input"
        :placeholder="placeholder"
        @keydown="$emit('keydown', $event)"
        @input="$emit('input', $event.target.value)"
        @change="$emit('change', $event.target.value)"
      />
      <span class="bottom-border-input-text__input-after">
        <slot name="after" />
      </span>
    </span>
    <slot
      v-for="error in errors"
      name="error"
      :error="error"
    >
      <InputValidationError
        :key="error"
        center-text
      >
        {{ error }}
      </InputValidationError>
    </slot>
  </label>
</template>

<style lang="scss" scoped>
.bottom-border-input-text {
  display: block;

  &__label {
    display: block;
    align-items: center;
  }

  &__input {
    padding: 24px 0 0 8px;
    border: none;
    outline: none;
    border-bottom: 1px solid $color-primary-10;
    margin-top: 8px;
    width: 100%;
    font-weight: 500;
    font-size: 16px;
    line-height: 18px;
    height: 60px;
    background: none;
    box-sizing: border-box;
    background-clip: text;

    &::placeholder {
      color: $color-primary-30;
      -webkit-text-fill-color: $color-primary-30;
    }

    &:focus {
      border-bottom: 1px solid $color-primary-100;
    }

    @at-root .bottom-border-input-text--error & {
      border-bottom: 1px solid $color-alert;
    }

    &-wrapper {
      position: relative;
    }

    &-after {
      position: absolute;
      right: 1px;
      height: 100%;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      padding: 0 8px;
    }
  }
}
</style>
