<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import BaseIcon from "@/library/BaseIcon.vue";
</script>

<template>
  <div class="checkout-download-app-logo">
    <InlineSvg
      name="logo-app"
      class="checkout-download-app-logo__logo"
    />
    <BaseIcon
      name="arrow-down"
      class="checkout-download-app-logo__download"
    />
  </div>
</template>

<style lang="scss" scoped>
.checkout-download-app-logo {
  position: relative;
  display: inline-block;
  width: 112px;
  height: 112px;
  margin-top: 8px;

  &__logo {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, calc(-50% + 5px));
  }

  &__download {
    background-color: $color-brand-300;
    border-radius: 100px;
    font-size: 24px;
    padding: 6px;
    position: absolute;
    right: -12px;
    top: -8px;
  }
}
</style>
