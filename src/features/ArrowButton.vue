<script setup>
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <button
    class="icon-btn"
    :class="{
      disabled: props.disabled,
    }"
    :disabled="props.disabled"
    @click="emit('click')"
  >
    <InlineSvg
      name="expansion-arrow"
      :class="{
        flip: props.isOpen,
        horizontal: props.horizontal,
        disabled: props.disabled,
      }"
    />
  </button>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.icon-btn {
  background-color: transparent;
  border-radius: 50%;
  flex-shrink: 0;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: $color-primary-5;

    &.disabled {
      background-color: none;
    }
  }

  transform: rotate(360deg);
  color: $color-primary-50;

  .flip {
    transform: rotate(180deg);

    &.horizontal {
      transform: rotate(270deg);
    }
  }

  .horizontal {
    transform: rotate(90deg);
  }

  &.disabled {
    background-color: none;
    pointer-events: none;
    color: $color-primary-30;
  }
}
</style>
