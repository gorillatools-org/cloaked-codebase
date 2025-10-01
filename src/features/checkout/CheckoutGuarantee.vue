<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
</script>

<template>
  <BaseText
    as="p"
    variant="body-small-medium"
    class="checkout-guarantee"
  >
    <BaseIcon
      name="shield-lock"
      class="checkout-guarantee__icon"
    />
    30-day money-back guarantee
  </BaseText>
</template>

<style scoped lang="scss">
.checkout-guarantee {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}
</style>
