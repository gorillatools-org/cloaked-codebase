<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <header class="page-checkout-header">
    <div class="page-checkout-header__logo-container">
      <InlineSvg
        name="cloaked-logo-full"
        class="page-checkout-header__logo"
      />
    </div>
    <div class="page-checkout-header__navigation">
      <slot />
    </div>
  </header>
</template>

<style scoped lang="scss">
.page-checkout-header {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1120px;
  margin: 0 auto;
  padding: 22px 16px;
  background: $color-base-black-5;
  background-blend-mode: overlay;
  backdrop-filter: blur(27px);
  color: $color-primary-100;

  @media all and (min-width: $screen-xl) {
    justify-content: space-between;
    padding: 28px 16px;
    background-blend-mode: normal;
    backdrop-filter: none;
    background-color: transparent;
  }

  &__logo-container {
    width: 128px;
    min-height: 32px; // Set a fixed height to prevent layout shift
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__logo {
    height: 26px * 1.5;
    width: 101px * 1.5;
  }

  &__navigation {
    display: none;

    @media all and (min-width: $screen-xl) {
      display: block;
    }
  }
}
</style>
