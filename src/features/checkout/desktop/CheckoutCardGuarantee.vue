<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseSheet from "@/library/BaseSheet.vue";
</script>

<template>
  <BaseSheet
    elevation="md"
    spacing-x="sm"
    spacing-y="sm"
    rounding="sm"
    class="checkout-card-guarantee"
  >
    <BaseText
      as="p"
      variant="body-small-medium"
      class="checkout-card-guarantee__text"
    >
      <BaseIcon
        name="shield-lock"
        class="checkout-card-guarantee__icon"
      />
      Hassle free 30 day money back guarantee. Switch plans anytime.
    </BaseText>
  </BaseSheet>
</template>

<style scoped lang="scss">
.checkout-card-guarantee {
  background: $color-base-black-5;
  border: none;

  &__text {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  &__icon {
    width: 16px;
    height: 16px;
  }
}
</style>
