<script setup lang="ts">
import VCBaseCard from "@/features/VirtualCards/base/card/VCBaseCard.vue";

type Props = {
  type: "active" | "canceled";
};

defineProps<Props>();
</script>
<template>
  <VCBaseCard>
    <div class="vc-card-list-item-skeleton__body">
      <div class="vc-card-list-item-skeleton__identity-container">
        <div class="vc-card-list-item-skeleton__icon skeleton-shimmer"></div>
      </div>
      <div class="vc-card-list-item-skeleton__content">
        <div class="vc-card-list-item-skeleton__name skeleton-shimmer"></div>
        <div
          v-if="type === 'active'"
          class="vc-card-list-item-skeleton__available skeleton-shimmer"
        ></div>
      </div>
      <div class="vc-card-list-item-skeleton__last4-container">
        <div class="vc-card-list-item-skeleton__last4 skeleton-shimmer"></div>
      </div>
    </div>
  </VCBaseCard>
</template>
<style scoped lang="scss">
@import "@/features/VirtualCards/assets/skeleton";

.vc-card-list-item-skeleton {
  &__body {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 16px;
    background: $color-primary-1;
    border-radius: 16px;
  }

  &__identity-container {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }

  &__name {
    height: 16px;
    width: 80px;
    border-radius: 4px;
  }

  &__available {
    height: 14px;
    width: 120px;
    border-radius: 4px;
  }

  &__last4-container {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    flex-shrink: 0;
  }

  &__last4 {
    height: 22px;
    width: 70px;
    margin-right: 30px;
    border-radius: 4px;
  }
}
</style>
