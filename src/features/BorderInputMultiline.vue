<script setup>
import { onMounted, ref, watch } from "vue";
import InputValidationError from "@/features/InputValidationError.vue";

const props = defineProps({
  value: {
    type: String,
    default: "",
  },
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

defineEmits(["input", "change"]);

const input = ref(null);

watch(
  () => props.value,
  (newValue) => {
    if (newValue !== input.value.innerText) {
      input.value.innerText = newValue;
    }
  },
  { deep: true }
);

onMounted(() => {
  input.value.innerText = props.value;
});

const onPaste = (event) => {
  const text = event.clipboardData.getData("text/plain");
  document.execCommand("insertText", false, text);
};
</script>

<template>
  <label
    class="border-input-multiline"
    :class="{ 'border-input-multiline--error': errors.length }"
  >
    <span
      v-if="label"
      class="border-input-multiline__label"
    >
      {{ label }}
    </span>
    <span class="border-input-multiline__input">
      <span
        ref="input"
        class="border-input-multiline__input-field"
        :contenteditable="true"
        @input="$emit('input', $event.target.innerText)"
        @blur="$emit('change', $event.target.innerText)"
        @paste.prevent="onPaste"
      />
      <span
        v-if="!value.trim()"
        class="border-input-multiline__input-placeholder"
      >
        {{ placeholder }}
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
.border-input-multiline {
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
    position: relative;
    display: block;

    &-field {
      display: block;
      padding: 20px;
      border: 1px solid $color-primary-10;
      border-radius: 15px;
      margin-top: 8px;
      width: 100%;
      font-weight: 400;
      font-size: 12px;
      line-height: 150%;
      color: $color-primary-100;
      background-color: $color-base-white-100;
      font-family: $global-font;
      max-width: 100%;
      cursor: text;

      @at-root .border-input-multiline--error & {
        border: 1px solid $color-alert;
      }

      &:focus {
        outline: 1px solid $color-primary-100;
      }
    }

    &-placeholder {
      display: block;
      position: absolute;
      pointer-events: none;
      color: $color-primary-50;
      padding: 0 20px;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      font-weight: 400;
      font-size: 12px;
      line-height: 150%;
      font-family: $global-font;
    }
  }
}
</style>
