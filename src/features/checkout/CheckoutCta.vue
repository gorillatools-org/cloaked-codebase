<script setup lang="ts">
import BaseButton from "@/library/BaseButton.vue";

withDefaults(defineProps<{ primary?: boolean }>(), { primary: false });
</script>

<template>
  <BaseButton
    size="lg"
    full-width
    class="checkout-cta"
    :class="{ 'checkout-cta--primary': primary }"
  >
    <slot />
  </BaseButton>
</template>

<style scoped lang="scss">
.checkout-cta {
  &--primary {
    background-color: $color-safe-zone-blue;

    &:disabled {
      opacity: 0.7;
    }

    :deep(.base-button__icon) {
      background-color: $color-base-white-15;
    }
  }
}
</style>
