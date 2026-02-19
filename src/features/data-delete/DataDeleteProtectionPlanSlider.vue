<script setup>
import DataDeleteProtectionPlanFeatureCard from "@/features/data-delete/atoms/DataDeleteProtectionPlanFeatureCard.vue";

defineProps({
  items: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div
    class="data-delete-protection-plan-slider__scroll-container"
    role="list"
  >
    <DataDeleteProtectionPlanFeatureCard
      v-for="(item, index) in items"
      :key="index"
      :feature="item"
      :index="index"
      role="listitem"
      class="data-delete-protection-plan-slider__card"
    />
  </div>
</template>

<style lang="scss" scoped>
.data-delete-protection-plan-slider {
  &__scroll-container {
    width: calc(100% + 32px);
    margin: 0 -16px;
    gap: 16px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    padding: 12px 16px 12px 60px;
    scroll-padding-left: 60px;
    scroll-behavior: smooth;
    user-select: none;
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    max-width: 100vw;

    &::-webkit-scrollbar {
      display: none;
    }

    @media screen and (min-width: $screen-sm) {
      padding-left: 33px;
      scroll-padding-left: 33px;
    }
  }

  &__card {
    min-width: 226px;
    max-width: 226px;
    flex: 0 0 auto;
    scroll-snap-align: start;
    scroll-snap-stop: always;

    &.data-delete-card {
      border: 0;
      background-color: $color-base-black-10-dark;
    }
  }
}
</style>
