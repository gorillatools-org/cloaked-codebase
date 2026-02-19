<script setup>
import CheckButton from "@/features/CheckButton.vue";
import PreferencesParagraph from "./PreferencesParagraph";

const emit = defineEmits(["input"]);

const props = defineProps({
  value: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

function toggle() {
  if (props.disabled) {
    return;
  }

  emit("input", !props.value);
}
</script>

<template>
  <PreferencesParagraph
    class="preferences-check-paragraph"
    @click="toggle"
  >
    <CheckButton
      :value="props.value"
      :square="true"
      :disabled="props.disabled"
      @input="toggle"
    />

    <span class="preferences-check-paragraph__label">
      <slot />
    </span>
  </PreferencesParagraph>
</template>

<style lang="scss" scoped>
.preferences-check-paragraph {
  display: flex;
  gap: 8px;
  user-select: none;

  &:hover {
    cursor: pointer;
  }

  .check-button {
    display: block;
    flex-shrink: 0;
  }

  &__label {
    display: block;
  }
}
</style>
