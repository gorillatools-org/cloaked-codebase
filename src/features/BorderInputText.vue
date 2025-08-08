<script setup>
import { useAttrs } from "vue";
import InputValidationError from "@/features/InputValidationError.vue";

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
  max: {
    type: Number,
    default: 175,
  },
});

defineEmits(["input", "change", "click"]);

const attrs = useAttrs();
</script>

<template>
  <label
    class="border-input-text"
    :class="{ 'border-input-text--error': errors.length }"
  >
    <span
      v-if="label"
      class="border-input-text__label"
    >
      {{ label }}
    </span>
    <span
      class="border-input-text__input-wrapper"
      @click="$emit('click')"
    >
      <input
        v-bind="attrs"
        ref="input"
        class="border-input-text__input"
        :placeholder="placeholder"
        :maxlength="max"
        @input="$emit('input', $event.target.value)"
        @change="$emit('change', $event.target.value)"
      />
      <span class="border-input-text__input-after">
        <slot name="after" />
      </span>
    </span>
    <slot
      v-for="error in errors"
      name="error"
      :error="error"
    >
      <InputValidationError :key="error">
        {{ error }}
      </InputValidationError>
    </slot>
  </label>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.border-input-text {
  display: block;

  &__label {
    display: block;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    align-items: center;
    color: $color-primary-100;
  }

  &__input {
    padding: 20px;
    border: 1px solid $color-primary-10;
    border-radius: 15px;
    margin-top: 8px;
    width: 100%;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    background-color: $color-base-white-100;
    font-family: $global-font;

    @at-root .border-input-text--error & {
      border: 1px solid $color-alert;
    }

    &::placeholder {
      color: $color-primary-50;
    }

    &:focus {
      outline: 1px solid $color-primary-100;
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
