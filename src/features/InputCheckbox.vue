<script setup>
import CheckboxChecked from "@/assets/icons/checkbox-checked.svg";
import CheckboxUnchecked from "@/assets/icons/checkbox-unchecked.svg";

import { computed } from "vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const checkboxModel = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});
</script>

<template>
  <label
    class="input-checkbox"
    :class="{ 'input-checkbox--disabled': props.disabled }"
  >
    <input
      :id="props.id"
      v-model="checkboxModel"
      type="checkbox"
      :value="props.id"
      :disabled="props.disabled"
      class="input-checkbox__input"
    />
    <CheckboxChecked class="input-checkbox__input--checked" />
    <CheckboxUnchecked class="input-checkbox__input--unchecked" />
    <slot />
  </label>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.input-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: $color-primary-100;

  &:hover {
    opacity: 0.9;
  }

  &--disabled {
    opacity: 1;
    color: $color-primary-50;
    cursor: not-allowed;
  }

  &__input {
    margin: 0;

    &--checked,
    &--unchecked {
      flex-shrink: 0;

      @at-root .input-checkbox--disabled & {
        opacity: 0.25;
      }
    }

    &--checked {
      display: none;

      @at-root .input-checkbox__input:checked ~ & {
        display: block;
      }
    }

    &--unchecked {
      display: block;

      @at-root .input-checkbox__input:checked ~ & {
        display: none;
      }
    }
  }
}
</style>
