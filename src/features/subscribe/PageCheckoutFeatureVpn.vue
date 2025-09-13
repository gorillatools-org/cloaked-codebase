<script setup>
import BaseText from "@/library/BaseText.vue";
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <div class="checkout-feature-vpn">
    <InlineSvg
      name="tick-circle-star"
      class="checkout-feature-vpn__icon"
    />
    <div class="checkout-feature-vpn__content">
      <BaseText
        as="h2"
        variant="headline-5-bold"
        class="checkout-feature-vpn__content-copy"
      >
        Mobile VPN is now included
      </BaseText>
      <BaseText
        as="p"
        variant="body-3-regular"
        class="checkout-feature-vpn__content-copy"
      >
        Your subscription now includes private, lightning-fast VPN access—at no
        extra cost.
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
.checkout-feature-vpn {
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
