<script setup>
import BaseText from "@/library/BaseText.vue";

defineProps({
  variant: {
    type: String,
    required: true,
    validator: (value) => ["error"].includes(value),
  },
  message: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <BaseText
    as="span"
    variant="body-small-medium"
    class="base-input-feedback"
    :class="`base-input-feedback--${variant}`"
  >
    <slot>
      {{ message }}
    </slot>
  </BaseText>
</template>

<style scoped lang="scss">
.base-input-feedback {
  &--error {
    color: $color-alert;
  }
}
</style>
