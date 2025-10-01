<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <BaseText
    as="p"
    variant="body-2-semibold"
    class="checkout-paragraph"
  >
    <slot />
  </BaseText>
</template>

<style scoped lang="scss">
.checkout-paragraph {
  margin-top: 10px;
}
</style>
