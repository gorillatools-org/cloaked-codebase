<script setup lang="ts">
import PageCheckoutReviews from "@/features/subscribe/PageCheckoutReviews.vue";
</script>

<template>
  <PageCheckoutReviews class="checkout-reviews" />
</template>

<style lang="scss" scoped>
.checkout-reviews {
  &.page-checkout-reviews {
    padding: 8px 16px;

    @media all and (min-width: $screen-xl) {
      padding: 10px 16px;
    }
  }
}
</style>
