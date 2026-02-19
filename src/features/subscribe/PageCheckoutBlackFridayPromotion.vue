<script setup>
import BaseText from "@/library/BaseText.vue";
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <div class="checkout-black-friday-promotion">
    <InlineSvg
      name="tick-circle-star-green"
      class="checkout-black-friday-promotion__icon"
    />
    <div class="checkout-black-friday-promotion__content">
      <BaseText
        as="h2"
        variant="headline-5-bold"
        class="checkout-black-friday-promotion__content-copy"
      >
        Limited Time Cyber Monday Offer!
      </BaseText>
      <BaseText
        as="p"
        variant="body-3-regular"
        class="checkout-black-friday-promotion__content-copy checkout-black-friday-promotion__content-description"
      >
        Save 50% on annual plans
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
.checkout-black-friday-promotion {
  border: 1px solid $color-safe-zone-green;
  padding: 12px;
  background: $color-safe-zone-green-15;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &__icon {
    width: 32px;
    flex-shrink: 0;
  }

  &__content {
    &-copy {
      color: $color-base-black-100;
    }

    &-description {
      margin-top: 2px;
    }
  }
}
</style>
