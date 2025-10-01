<script setup>
import inlineSvg from "@/features/InlineSvg";

defineProps({
  checked: {
    type: Boolean,
    default: false,
  },
  pending: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(["click"]);
</script>
<template>
  <button
    class="checkbox"
    :class="{ checked: checked, pending: pending }"
    @click="emits('click')"
  >
    <inlineSvg
      v-if="checked"
      key="check"
      name="check"
    />
    <inlineSvg
      v-else-if="pending"
      key="dash"
      name="dash"
    />
  </button>
</template>
<style scoped lang="scss">
/* stylelint-disable */
.checkbox {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  padding: 0;
  margin: 0;
  border: 2px solid $color-primary-30;
  color: $color-primary-100;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    width: 100%;
    height: 100%;
    max-width: 9px;
    max-height: 9px;
  }

  &.checked {
    border: none;
    background-color: $color-primary-100;
    color: $color-primary-1;
  }

  &.pending {
    border-color: $color-primary-100;
  }
}
</style>
