<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import InlineSvg from "@/features/InlineSvg.vue";
</script>

<template>
  <div class="checkout-download-app-review">
    <BaseText
      variant="body-3-regular"
      as="p"
      class="checkout-download-app-review__text"
    >
      <slot />
    </BaseText>
    <div class="checkout-download-app-review__stars">
      <InlineSvg
        v-for="index in 5"
        :key="index"
        name="star"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.checkout-download-app-review {
  &__text {
    color: $color-base-black-90;
  }

  &__stars {
    display: flex;
    justify-content: center;
    gap: 6px;
    color: $color-warning;
    margin-top: 6px;
  }
}
</style>
