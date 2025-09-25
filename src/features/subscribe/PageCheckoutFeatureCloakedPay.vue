<script setup>
import BaseText from "@/library/BaseText.vue";
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <div class="checkout-feature-pay">
    <InlineSvg
      name="tick-circle-star-spam-protection"
      class="checkout-feature-pay__icon"
    />
    <div class="checkout-feature-pay__content">
      <BaseText
        as="h2"
        variant="headline-5-bold"
        class="checkout-feature-pay__content-copy"
      >
        Included Cloaked Pay to your plan
      </BaseText>
      <BaseText
        as="p"
        variant="body-3-regular"
        class="checkout-feature-pay__content-copy"
      >
        Get a new virtual card for every checkout.
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
.checkout-feature-pay {
  border: 1px solid $color-spam-protection;
  padding: 12px;
  background: $color-spam-protection-15;
  border-radius: 16px 12px;
  display: flex;
  gap: 8px;

  &__icon {
    width: 32px;
    flex-shrink: 0;
  }

  &__content {
    &-copy {
      color: #fff;
    }
  }
}
</style>
