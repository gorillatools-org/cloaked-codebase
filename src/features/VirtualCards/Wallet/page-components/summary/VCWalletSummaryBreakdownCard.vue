<script setup lang="ts">
import VCBaseCard from "@/features/VirtualCards/base/card/VCBaseCard.vue";
import BaseText from "@/library/BaseText.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import useCreationLimit from "@/features/VirtualCards/composables/useCreationLimit";
import { computed } from "vue";

export type SummaryBreakdownProps = {
  label: string;
  value: number;
  valueColor?: "default" | "positive" | "negative";
  tooltip?: string;
  clickable?: boolean;
};

const props = withDefaults(defineProps<SummaryBreakdownProps>(), {
  tooltip: "",
  clickable: false,
  valueColor: "default",
});

const { currencyFormatConfig } = useCreationLimit();

const formattedValue = computed(() => {
  const formatted = new Intl.NumberFormat("en-US", currencyFormatConfig).format(
    props.value / 100
  );

  if (props.valueColor === "positive") {
    return `+ ${formatted}`;
  }

  return formatted;
});
</script>

<template>
  <VCBaseCard
    :clickable="clickable"
    class="vc-wallet-summary-breakdown-card"
  >
    <div class="vc-wallet-summary-breakdown-card__body">
      <div class="vc-wallet-summary-breakdown-card__label-container">
        <BaseText variant="headline-5-bold">{{ label }}</BaseText>
        <UiTooltip :title="tooltip">
          <BaseIcon
            class="vc-wallet-summary-breakdown-card__label-icon"
            name="info"
          />
        </UiTooltip>
      </div>
      <div class="vc-wallet-summary-breakdown-card__value-container">
        <BaseText
          variant="body-2-semibold"
          :class="[`vc-wallet-summary-breakdown-card__value-${valueColor}`]"
        >
          {{ formattedValue }}
        </BaseText>
        <BaseIcon
          v-if="clickable"
          name="chevron-right"
          class="vc-wallet-summary-breakdown-card__value-icon"
        />
      </div>
    </div>
  </VCBaseCard>
</template>

<style lang="scss" scoped>
.vc-wallet-summary-breakdown-card {
  &__body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 16px;
  }

  &__label {
    &-container {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    &-icon {
      font-size: 19px;
    }
  }

  &__value {
    &-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    &-icon {
      font-size: 18px;
      margin-top: -1px;
      transition: transform 0.15s ease-out;

      .vc-wallet-summary-breakdown-card:hover & {
        transform: translateX(3px);
        transition-delay: 0.1s;
      }
    }

    &-positive {
      color: $color-success;
    }

    &-negative {
      color: $color-alert;
    }
  }
}
</style>
