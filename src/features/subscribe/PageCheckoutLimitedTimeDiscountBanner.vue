<script setup>
import BaseText from "@/library/BaseText.vue";
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <div class="checkout-limited-time-discount-banner">
    <InlineSvg
      name="tick-circle-star"
      class="checkout-limited-time-discount-banner__icon"
    />
    <div class="checkout-limited-time-discount-banner__content">
      <BaseText
        as="h2"
        variant="headline-5-bold"
        class="checkout-limited-time-discount-banner__content-copy"
      >
        Limited Time Winter Sale!
      </BaseText>
      <BaseText
        as="p"
        variant="body-3-regular"
        class="checkout-limited-time-discount-banner__content-copy"
      >
        Save 20% on annual plans.
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
.checkout-limited-time-discount-banner {
  border: 1px solid $color-brand-3-90-dark;
  padding: 12px;
  background: $color-safe-zone-blue-15;
  border-radius: 12px;
  display: flex;
  gap: 8px;

  &__icon {
    width: 32px;
    flex-shrink: 0;
  }

  &__content {
    &-copy {
      color: $color-base-black-100;
    }
  }
}
</style>
