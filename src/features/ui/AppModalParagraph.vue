<script setup>
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <BaseText
    as="p"
    variant="body-2-semibold"
    class="app-modal-paragraph"
  >
    <slot />
  </BaseText>
</template>

<style lang="scss" scoped>
.app-modal-paragraph {
  padding: 0 32px;
  margin-top: 16px;
}
</style>
