<script setup lang="ts">
import BaseSheet from "@/library/BaseSheet.vue";
</script>

<template>
  <BaseSheet
    class="checkout-card"
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
  >
    <slot />
  </BaseSheet>
</template>

<style scoped lang="scss">
.checkout-card {
  border: none;
  display: flex;
  flex-direction: column;
  row-gap: 36px;

  @at-root .theme-dark & {
    background: $color-base-white-10-light;
  }
}
</style>
