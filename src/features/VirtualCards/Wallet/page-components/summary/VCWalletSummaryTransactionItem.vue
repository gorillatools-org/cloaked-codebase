<script setup lang="ts">
import VCBaseCard from "@/features/VirtualCards/base/card/VCBaseCard.vue";
import BaseText from "@/library/BaseText.vue";
import useCreationLimit from "@/features/VirtualCards/composables/useCreationLimit";
import CloakedLogoIcon from "@/assets/icons/cloaked-logo-full.svg";
import { computed } from "vue";

type Props = {
  value: number;
};

const props = defineProps<Props>();

const { currencyFormatConfig } = useCreationLimit();

const formattedValue = computed(() => {
  return new Intl.NumberFormat("en-US", currencyFormatConfig).format(
    props.value / 100
  );
});
</script>

<template>
  <VCBaseCard class="vc-wallet-summary-transaction-item">
    <div class="vc-wallet-summary-transaction-item__body">
      <div class="vc-wallet-summary-transaction-item__infos-container">
        <div class="vc-wallet-summary-transaction-item__infos-img-container">
          <CloakedLogoIcon
            class="vc-wallet-summary-transaction-item__infos-img-logo"
          />
        </div>
        <div class="vc-wallet-summary-transaction-item__infos-texts-container">
          <BaseText
            variant="headline-6-bold"
            class="vc-wallet-summary-transaction-item__infos-title"
          >
            Cloaked Payment
          </BaseText>
          <BaseText
            variant="body-2-semibold"
            class="vc-wallet-summary-transaction-item__infos-date"
          >
            Aug 14, 2:37 PM
          </BaseText>
        </div>
      </div>
      <div class="vc-wallet-summary-transaction-item__value-container">
        <BaseText
          variant="headline-6-bold"
          class="vc-wallet-summary-transaction-item__value"
        >
          {{ formattedValue }}
        </BaseText>
        <BaseText
          class="vc-wallet-summary-transaction-item__value-description"
          variant="body-3-regular"
        >
          Cleared
        </BaseText>
      </div>
    </div>
  </VCBaseCard>
</template>

<style lang="scss" scoped>
.vc-wallet-summary-transaction-item {
  &__body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
  }

  &__infos {
    &-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    &-img-container {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: $color-primary-10;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &-img-logo {
      width: 24px;
      height: 24px;
    }

    &-texts-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &-date {
      color: $color-primary-50;
    }
  }

  &__value {
    &-container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
    }

    &-description {
      color: $color-primary-50;
    }
  }
}
</style>
