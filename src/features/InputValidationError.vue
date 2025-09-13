<script setup>
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  centerText: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <BaseText
    as="div"
    variant="body-small-medium"
    class="input-validation-error"
    :class="{ 'text-center': props.centerText }"
  >
    <slot />
  </BaseText>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.input-validation-error {
  margin-top: 4px;
  color: $color-alert;
  &.text-center {
    text-align: center;
  }
}
</style>
