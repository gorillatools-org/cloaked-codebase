<script setup>
import BaseSheet from "@/library/BaseSheet.vue";
</script>

<template>
  <BaseSheet
    class="enrollment-card"
    spacing-y="lg"
    spacing-x="sm"
  >
    <slot />
  </BaseSheet>
</template>

<style scoped lang="scss">
.enrollment-card {
  display: grid;
  gap: 16px 8px;
}
</style>
