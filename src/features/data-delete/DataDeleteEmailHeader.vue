<script setup>
import PageCheckoutReviews from "@/features/subscribe/PageCheckoutReviews.vue";
import InlineSvg from "@/features/InlineSvg.vue";
</script>
<template>
  <div class="email-breaches-header">
    <PageCheckoutReviews />

    <div class="email-breaches-header__logo">
      <InlineSvg
        name="cloaked-logo-full"
        class="email-breaches-header__logo-full"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
.email-breaches-header {
  display: none;

  &__logo {
    padding: 27px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__logo-full {
    width: 128px;
  }
}

@media all and (min-width: $screen-lg) {
  .email-breaches-header {
    display: block;
  }
}
</style>
