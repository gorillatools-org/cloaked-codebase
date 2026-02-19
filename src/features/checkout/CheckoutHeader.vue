<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <header class="checkout-header">
    <div class="checkout-header__logo">
      <InlineSvg name="cloaked-logo-full" />
    </div>
    <div class="checkout-header__navigation">
      <slot />
    </div>
  </header>
</template>

<style scoped lang="scss">
.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 16px;

  @media all and (min-width: $screen-xl) {
    padding: 32px 16px;
  }

  &__logo {
    width: 128px;
    height: 22px;

    & > * {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
