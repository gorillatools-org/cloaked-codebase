<script setup>
const emit = defineEmits(["change", "input"]);
const props = defineProps({
  value: {
    type: Boolean,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const handleChange = () => {
  const newValue = !props.value;
  emit("change", newValue);
  emit("input", newValue);
};
</script>
<template>
  <label
    class="ui-switch-input"
    :class="{
      'ui-switch-input--checked': props.value,
      'ui-switch-input--disabled': props.disabled,
    }"
  >
    <input
      :value="props.value"
      aria-id="SwitchToggleButton"
      type="checkbox"
      name="checkbox"
      :checked="props.value"
      autocomplete="off"
      data-lpignore="true"
      data-form-type="other"
      :disabled="props.disabled"
      @change="handleChange"
    />

    <div class="ui-switch-input__pill" />
  </label>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.ui-switch-input {
  display: block;
  position: relative;
  height: 33px;
  width: 50px;
  color: $color-primary-20;
  background: $color-primary-20;
  border-radius: 16px;
  border: 2px solid currentcolor;
  transition: all 0.2s ease-in-out;

  --pill-left: 1px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  &__pill {
    width: 28px;
    height: 28px;
    background: $color-primary-1-light;
    border-radius: 50%;
    position: absolute;
    left: var(--pill-left);
    top: 1px;
    box-shadow: 1px 1px 4px rgb(0 0 0 / 19%);
    transition: left 0.2s ease-in-out;
  }

  &--checked {
    color: $color-success;
    background-color: $color-success;

    --pill-left: calc(100% - 28px);
  }

  &--disabled {
    opacity: 0.3;
  }

  &:not(&--disabled):hover {
    cursor: pointer;
  }
}
</style>
