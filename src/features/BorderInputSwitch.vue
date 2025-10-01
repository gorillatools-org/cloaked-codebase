<script setup>
import UiSwitchInput from "@/features/UiSwitchInput.vue";
import InputValidationError from "@/features/InputValidationError.vue";

defineProps({
  title: {
    type: String,
    default: "",
  },
  text: {
    type: String,
    default: "",
  },
  errors: {
    type: Array,
    default: () => [],
  },
  value: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["input"]);
</script>

<template>
  <div
    class="border-input-switch"
    :class="{ 'border-input-switch--error': errors.length }"
  >
    <label
      class="border-input-switch__label"
      tabindex="0"
      @keydown.enter="$emit('input', !value)"
    >
      <span>
        <span
          v-if="title"
          class="border-input-switch__title"
        >
          {{ title }}
        </span>
        <span
          v-if="text"
          class="border-input-switch__subtitle"
        >
          {{ text }}
        </span>
      </span>
      <UiSwitchInput
        v-bind="$attrs"
        class="border-input-switch__input"
        :value="value"
        @input="$emit('input', $event)"
      />
    </label>
    <slot
      v-for="error in errors"
      name="error"
      :error="error"
    >
      <InputValidationError :key="error">
        {{ error }}
      </InputValidationError>
    </slot>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.border-input-switch {
  &__label {
    display: flex;
    padding: 20px;
    border: 1px solid $color-primary-10;
    border-radius: 15px;
    cursor: pointer;

    &:focus {
      // reconsider
      outline: 1px solid $color-primary-100;
    }

    &:active {
      outline: none;
    }

    @at-root .border-input-switch--error & {
      border: 1px solid $color-alert;
    }
  }

  &__title {
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-100;
    display: block;
  }

  &__subtitle {
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    color: $color-primary-70;
    margin-top: 8px;
    display: block;
  }

  &__input {
    margin-left: auto;
    flex-shrink: 0;
  }
}
</style>
