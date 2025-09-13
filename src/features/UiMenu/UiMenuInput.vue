<script setup>
import { reactive } from "vue";
const props = defineProps({
  value: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
});
const state = reactive({
  isFocused: false,
});

const emit = defineEmits(["input"]);

function handleInput($event) {
  emit("input", $event.target.value);
}
function handleFocus() {
  state.isFocused = true;
}
function handleBlur() {
  state.isFocused = false;
}
</script>

<template>
  <div
    class="ui-menu-input"
    :class="{
      'ui-menu-input--focused': state.isFocused,
    }"
  >
    <input
      type="text"
      :placeholder="props.placeholder"
      :value="props.value"
      :disabled="props.disabled"
      tabindex="0"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.ui-menu-input {
  width: 100%;
  padding: 5px 10px;
  height: 40px;
  color: $color-primary-100;

  input {
    border: none;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
    width: 100%;
    height: 30px;
    color: $color-primary-100;
    background: $color-background;

    &:active,
    &:focus-visible {
      outline: none;
    }
  }
}
</style>
