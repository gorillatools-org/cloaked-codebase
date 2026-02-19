<script setup lang="ts">
import VCBaseCard from "@/features/VirtualCards/base/card/VCBaseCard.vue";
</script>

<template>
  <VCBaseCard>
    <div class="vc-wallet-transaction-item-skeleton__body">
      <div class="vc-wallet-transaction-item-skeleton__identity-container">
        <div
          class="vc-wallet-transaction-item-skeleton__icon skeleton-shimmer"
        ></div>
        <div class="vc-wallet-transaction-item-skeleton__identity-infos">
          <div
            class="vc-wallet-transaction-item-skeleton__name skeleton-shimmer"
          ></div>
          <div
            class="vc-wallet-transaction-item-skeleton__date skeleton-shimmer"
          ></div>
        </div>
      </div>
      <div class="vc-wallet-transaction-item-skeleton__value-container">
        <div
          class="vc-wallet-transaction-item-skeleton__amount skeleton-shimmer"
        ></div>
        <div
          class="vc-wallet-transaction-item-skeleton__status skeleton-shimmer"
        ></div>
      </div>
    </div>
  </VCBaseCard>
</template>

<style scoped lang="scss">
@import "@/features/VirtualCards/assets/skeleton";

.vc-wallet-transaction-item-skeleton {
  &__body {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    height: 80px;
    background-color: $color-primary-1;
    border-radius: 16px;
  }

  &__identity-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__identity-infos {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__name {
    height: 18px;
    width: 120px;
    border-radius: 4px;
  }

  &__date {
    height: 16px;
    width: 100px;
    border-radius: 4px;
  }

  &__value-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }

  &__amount {
    height: 18px;
    width: 80px;
    border-radius: 4px;
  }

  &__status {
    height: 18px;
    width: 90px;
    border-radius: 4px;
  }
}
</style>
