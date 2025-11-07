<script setup lang="ts">
import VCBaseCard from "@/features/VirtualCards/base/card/VCBaseCard.vue";
import BaseText from "@/library/BaseText.vue";
import VCBasePill from "@/features/VirtualCards/base/VCBasePill.vue";
import VCBaseCircularProgress from "@/features/VirtualCards/base/VCBaseCircularProgress.vue";
import VCBaseAlert from "@/features/VirtualCards/base/VCBaseAlert.vue";
import useVirtualCardLimit from "@/features/VirtualCards/composables/useVirtualCardLimit";
import useVirtualCard from "@/features/VirtualCards/composables/useVirtualCard";

type Props = {
  cardId: string;
};

const props = defineProps<Props>();

const { isCanceled } = useVirtualCard(() => props.cardId);

const {
  formattedAvailableLimit,
  renewalDescription,
  spentPercentage,
  formattedSpent,
  openSpendingLimitModal,
} = useVirtualCardLimit(() => props.cardId);
</script>

<template>
  <VCBaseCard
    class="vc-wallet-card-limit-tile"
    :border="{ borderRadius: 24 }"
  >
    <div class="vc-wallet-card-limit-tile__content">
      <div class="vc-wallet-card-limit-tile__header">
        <div class="vc-wallet-card-limit-tile__available">
          <BaseText
            variant="body-small-medium"
            class="vc-wallet-card-limit-tile__label"
          >
            Available on card
          </BaseText>
          <BaseText
            variant="headline-2-semibold"
            class="vc-wallet-card-limit-tile__amount"
          >
            {{ isCanceled ? "$0.00" : formattedAvailableLimit }}
          </BaseText>
          <VCBasePill
            v-if="!isCanceled"
            label="Edit"
            :clickable="true"
            class="vc-wallet-card-limit-tile__edit"
            @click="openSpendingLimitModal"
          />
        </div>

        <div class="vc-wallet-card-limit-tile__spent">
          <VCBaseCircularProgress
            v-if="!isCanceled"
            :progress="spentPercentage"
            :size="114"
            :stroke="6"
          >
            <div class="vc-wallet-card-limit-tile__spent-content">
              <BaseText
                variant="body-small-medium"
                class="vc-wallet-card-limit-tile__spent-label"
              >
                Spent
              </BaseText>
              <BaseText
                variant="headline-5-bold"
                class="vc-wallet-card-limit-tile__spent-amount"
              >
                {{ formattedSpent }}
              </BaseText>
            </div>
          </VCBaseCircularProgress>
        </div>
      </div>

      <div class="vc-wallet-card-limit-tile__renewal-container">
        <VCBaseAlert
          class="vc-wallet-card-limit-tile__renewal-alert"
          size="md"
          :icon="null"
          center-content
          :description="isCanceled ? 'Card Canceled' : renewalDescription"
        ></VCBaseAlert>
      </div>
    </div>
  </VCBaseCard>
</template>

<style scoped lang="scss">
.vc-wallet-card-limit-tile {
  &__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 23px;
    min-height: 205px;
    container-name: content;
    container-type: inline-size;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  &__available {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__label {
    color: $color-primary-50;
  }

  &__amount {
    font-size: clamp(18px, 9cqw, 32px);
  }

  &__edit {
    width: fit-content;
    margin-top: 2px;
  }

  &__spent {
    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    &-label {
      color: $color-primary-50;
      font-weight: 500;
    }
  }

  &__renewal {
    &-container {
      display: flex;
      align-items: flex-end;
      flex-grow: 1;
    }

    &-alert {
      border-radius: 12px;
      width: 100%;
    }
  }
}
</style>
