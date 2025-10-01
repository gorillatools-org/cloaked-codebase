<script setup>
import BaseText from "@/library/BaseText.vue";
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <header class="checkout-header">
    <div class="checkout-header__content">
      <RouterLink :to="{ name: 'CheckoutPlans' }">
        <InlineSvg
          name="cloaked-logo-full"
          class="checkout-header__logo"
        />
      </RouterLink>
      <div class="checkout-header__navigation">
        <RouterLink :to="{ name: 'login' }">
          <BaseText variant="body-3-semibold">Log In</BaseText>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.checkout-header {
  padding: 0 16px;
  height: 70px;
  background-color: $color-base-white-100;
  border-bottom: 1px solid $color-base-black-10;
  box-shadow: 0 4px 24px 0 rgba($black, 0.05);

  @media all and (min-width: $screen-xl) {
    height: 90px;
    background-color: unset;
    border-bottom: unset;
    box-shadow: none;
  }

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1120px;
    margin: 0 auto;
    height: 100%;
  }

  &__logo {
    width: 128px;
  }
}
</style>
