<script setup>
// eslint-disable-next-line import/no-restricted-paths
import InlineSvg from "@/features/InlineSvg.vue";

const emit = defineEmits(["input"]);

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  value: {
    type: Boolean,
    required: true,
  },
});
</script>

<template>
  <label
    class="input-checkbox"
    :class="{ 'input-checkbox--disabled': props.disabled }"
  >
    <input
      type="checkbox"
      class="input-checkbox__input"
      :value="props.value"
      :checked="props.value"
      :disabled="props.disabled"
      @input="emit('input', $event.target.checked)"
    />
    <InlineSvg
      name="checkbox-checked"
      class="input-checkbox__input--checked"
    />
    <InlineSvg
      name="checkbox-unchecked"
      class="input-checkbox__input--unchecked"
    />
    <div class="checkbox-content">
      <slot />
    </div>
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

  .checkbox-content {
    margin-left: 8px;
  }

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
