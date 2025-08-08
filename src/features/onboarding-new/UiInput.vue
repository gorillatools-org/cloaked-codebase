<script setup>
import { ref, watch, nextTick } from "vue";
const emit = defineEmits(["input", "submit"]);
const props = defineProps({
  placeholder: {
    type: String,
    required: false,
    default: "",
  },
  type: {
    type: String,
    required: false,
    default: "text",
  },
  value: {
    type: String,
    required: true,
  },
  focused: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const inputRef = ref(null);

watch(
  () => props.focused,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        inputRef?.value?.focus();
      });
    }
  },
  { immediate: true }
);
</script>
<template>
  <input
    ref="inputRef"
    :type="props.type"
    :placeholder="props.placeholder"
    class="ui-input"
    :value="props.value"
    @input="emit('input', $event)"
    @keydown.enter="$emit('submit')"
  />
</template>
<style lang="scss" scoped>
.ui-input {
  color: $color-primary-100;
  border: 1px solid $color-primary-50;
  padding: 24px;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  background: transparent;
  outline: none;
  width: 100%;
  border-radius: 12px;

  &::placeholder {
    color: $color-primary-20;
  }

  &:focus {
    outline: none;
    border: 1px solid $color-primary-100;
  }
}
</style>
