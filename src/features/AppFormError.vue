<script setup>
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <BaseText
    as="p"
    variant="body-small-medium"
    class="app-form-error"
  >
    <slot />
  </BaseText>
</template>

<style lang="scss" scoped>
.app-form-error {
  color: $color-alert;
  margin-top: 4px;
}
</style>
