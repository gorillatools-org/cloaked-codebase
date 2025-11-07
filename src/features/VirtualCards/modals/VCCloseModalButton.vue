<script setup lang="ts">
import BaseIcon from "@/library/BaseIcon.vue";

type Props = {
  disabled?: boolean;
};

const emit = defineEmits(["close"]);

withDefaults(defineProps<Props>(), {
  disabled: false,
});
</script>

<template>
  <button
    type="button"
    class="vc-close-modal-button"
    aria-label="Close"
    title="Close"
    :disabled="disabled"
    @click="emit('close')"
  >
    <BaseIcon
      name="close"
      class="vc-close-modal-button__icon"
    />
  </button>
</template>

<style lang="scss" scoped>
.vc-close-modal-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
  border-radius: 50%;
  background-color: $color-base-black-5;
  border: none;
  transition: background-color 0.1s ease-in;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:not(:disabled):hover {
    background-color: $color-base-black-15;
  }

  &__icon {
    font-size: 16px;
  }
}
</style>
