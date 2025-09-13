<script setup>
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <BaseText
    as="h3"
    variant="headline-3-bold"
    class="preferences-title"
  >
    <slot />
  </BaseText>
</template>

<style lang="scss" scoped>
.preferences-title {
  display: flex;
  align-items: center;
  color: $color-primary-100;
  margin-bottom: 16px;
  margin-top: 40px;
}
</style>
