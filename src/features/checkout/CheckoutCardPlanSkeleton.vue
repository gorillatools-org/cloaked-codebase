<script setup lang="ts">
import BaseSheet from "@/library/BaseSheet.vue";

defineProps<{ features: number }>();
</script>

<template>
  <BaseSheet
    spacing-y="lg"
    spacing-x="md"
    elevation="md"
    class="checkout-card-plan-skeleton"
  >
    <div class="checkout-card-plan-skeleton__title" />
    <div class="checkout-card-plan-skeleton__price" />
    <div class="checkout-card-plan-skeleton__cta" />
    <span
      v-for="index in features"
      :key="index"
      class="checkout-card-plan-skeleton__feature"
    />
  </BaseSheet>
</template>

<style lang="scss" scoped>
.checkout-card-plan-skeleton {
  display: flex;
  flex-direction: column;

  & > * {
    border-radius: 100px;
  }

  &__feature {
    @include skeleton;

    height: 20px;
    margin-top: 8px;
    width: 80%;

    &:nth-of-type(even) {
      width: 60%;
    }

    &:nth-of-type(odd) {
      width: 80%;
    }
  }

  &__title {
    @include skeleton;

    height: 20px;
    width: 120px;
  }

  &__price {
    @include skeleton;

    height: 35px;
    margin-top: 8px;
    width: 80%;
  }

  &__cta {
    @include skeleton;

    height: 56px;
    margin: 24px 0 32px;
  }
}
</style>
