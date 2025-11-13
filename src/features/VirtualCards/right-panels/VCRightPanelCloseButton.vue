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
    class="vc-right-panel-close-button"
    aria-label="Close"
    title="Close"
    :disabled="disabled"
    @click="emit('close')"
  >
    <BaseIcon
      name="close"
      class="vc-right-panel-close-button__icon"
    />
  </button>
</template>

<style lang="scss" scoped>
.vc-right-panel-close-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
  border-radius: 50%;
  border: none;
  background-color: transparent;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: transparent;
    border-radius: 50%;
    transform: scale(0.3);
    transition:
      transform 0.13s ease-in,
      background-color 0.13s ease-in;
  }

  &:not(:disabled):hover::after {
    transform: scale(1);
    background-color: $color-base-black-15;
  }

  &__icon {
    font-size: 24px;
    position: relative;
    z-index: 1;
  }
}
</style>
