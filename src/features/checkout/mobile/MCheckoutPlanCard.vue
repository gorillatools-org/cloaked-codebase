<script setup lang="ts">
import { computed, toRef } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.ts";
import { useSavings } from "@/features/subscribe/composables/useSavings.ts";
import {
  formattedPrice,
  roundedPrice,
} from "@/features/subscribe/composables/utils.ts";
import type { Plan } from "@/features/subscribe/types.ts";

type MCheckoutPlanCardProps = {
  plan: Plan;
  individualPlan: Plan | null;
  compareAtPrice: number | null;
  selected?: boolean;
};

const props = defineProps<MCheckoutPlanCardProps>();

const emit = defineEmits<{
  (e: "select", plan: Plan): void;
}>();

// Pricing for this plan
const planRef = toRef(() => props.plan);
const totalPrice = usePlanPrice(planRef);
const monthlyPrice = usePlanPrice(planRef, "monthly");
const perMemberMonthlyPrice = usePlanPrice(planRef, "per-member-monthly");

const savings = useSavings(
  perMemberMonthlyPrice,
  toRef(() => props.compareAtPrice)
);

// Pricing for the individual plan
const individualPlanMonthlyPrice = usePlanPrice(
  toRef(() => props.individualPlan),
  "monthly"
);

const individualPlanPriceDifference = computed(() => {
  if (
    individualPlanMonthlyPrice.value === null ||
    monthlyPrice.value === null
  ) {
    return null;
  }

  return roundedPrice(monthlyPrice.value - individualPlanMonthlyPrice.value);
});

// Display values
const description = computed(() => {
  const extra = props.plan.max_members - 1;
  return `Me + ${extra} ${extra === 1 ? "person" : "people"}`;
});

const priceDifferenceFormatted = computed(() => {
  if (individualPlanPriceDifference.value === null) {
    return null;
  }

  return `+${formattedPrice(individualPlanPriceDifference)}/mo`;
});

const savingsDisplay = computed(() => {
  return savings.value && savings.value > 0 ? savings.value : null;
});
</script>

<template>
  <button
    type="button"
    class="checkout-plan-card"
    :class="{ 'checkout-plan-card--selected': props.selected }"
    :aria-pressed="props.selected"
    @click="emit('select', props.plan)"
  >
    <div class="checkout-plan-card__header">
      <BaseText
        variant="caption-1-emphasized"
        class="checkout-plan-card__label"
      >
        For {{ props.plan.max_members }}
      </BaseText>
      <div
        v-if="savingsDisplay"
        class="checkout-plan-card__badge"
      >
        <BaseText variant="caption-1-emphasized">
          Save {{ savingsDisplay }}%
        </BaseText>
      </div>
    </div>

    <div class="checkout-plan-card__body">
      <div class="checkout-plan-card__details">
        <div class="checkout-plan-card__members">
          <BaseIcon
            :name="
              props.plan.max_members === 2 ? 'user-add-filled' : 'family-filled'
            "
            class="checkout-plan-card__icon"
          />
          <BaseText variant="callout-emphasized">
            {{ description }}
          </BaseText>
        </div>
      </div>

      <div class="checkout-plan-card__price">
        <BaseText variant="title-3-emphasized">
          {{ priceDifferenceFormatted }}
        </BaseText>
      </div>
    </div>

    <BaseText
      v-if="plan.recurring_interval === 'annually'"
      variant="caption-2-regular"
      class="checkout-plan-card__billed"
    >
      Billed at {{ formattedPrice(totalPrice) }}/yr
    </BaseText>
  </button>
</template>

<style lang="scss" scoped>
.checkout-plan-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 16px;
  background-color: $color-surface-l1;
  border: 1px solid $color-overlay-neutral-10;
  min-height: 75px;

  // Inset shadow placeholder so the transition to the selected state
  // animates smoothly (box-shadow needs matching layer count).
  box-shadow:
    inset 0 0 0 0 transparent,
    0 5px 20px rgb(0 0 0 / 5%);
  cursor: pointer;
  text-align: left;
  width: 100%;

  &--selected {
    border-color: $color-neutral-1000;

    // Inset shadow fakes a 2px border without causing layout shift
    box-shadow:
      inset 0 0 0 1px $color-neutral-1000,
      0 0 4px 0 rgb(0 0 0 / 8%),
      0 8px 8px 0 rgb(0 0 0 / 10%);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__label {
    color: $color-neutral-1000;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 0 8px;
    border-radius: 1000px;
    background-color: $color-overlay-status-positive-10;
    color: $color-status-positive;
  }

  &__body {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  &__details {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 2px;
    min-width: 0;
  }

  &__members {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__icon {
    font-size: 24px;
    color: $color-neutral-1000;
    flex-shrink: 0;
  }

  &__price {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__billed {
    color: $color-neutral-500;
  }
}
</style>
