<script setup>
import ButtonToggle from "@/features/ButtonToggle.vue";
import ChoosePlanOption from "@/features/subscribe/ChoosePlanOption.vue";
import ChoosePlanOptionSkeleton from "@/features/subscribe/ChoosePlanOptionSkeleton.vue";
import { watch, onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { useBillingCycle } from "@/features/subscribe/composables/useBillingCycle";
import { usePlanOptions } from "@/features/subscribe/composables/usePlanOptions";
import { usePlanComparisonPrice } from "@/features/subscribe/composables/usePlanComparisonPrice.js";
import store from "@/store/index.js";
import BaseText from "@/library/BaseText.vue";

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  discount: {
    type: Number,
    default: null,
  },
  anchor: {
    type: Number,
    default: null,
  },
});

const compareAtPerMemberPrice = usePlanComparisonPrice();

const { activePlan, isLoadingPlans, allPlans } = usePlans();

const { selectedBillingCycle, allBillingCycles } = useBillingCycle(allPlans);

const { billingCycleOptions, selectedPlanOptionId, selectedPlanOption } =
  usePlanOptions({
    selectedBillingCycle,
  });

onMounted(() => {
  posthogCapture("user_clicked_period_toggle", {
    billing_period: selectedBillingCycle.value,
  });
});

watch(selectedBillingCycle, (newValue) => {
  posthogCapture("user_clicked_period_toggle", { billing_period: newValue });
});

watch(selectedPlanOption, (newValue) => {
  if (
    newValue.title === "Individual" &&
    selectedBillingCycle.value === "annually"
  ) {
    posthogCapture("user_clicked_individual_annual_plan");
  }
  if (
    newValue.title === "Couple" &&
    selectedBillingCycle.value === "annually"
  ) {
    posthogCapture("user_clicked_couple_annual_plan");
  }
  if (
    newValue.title === "Family" &&
    selectedBillingCycle.value === "annually"
  ) {
    posthogCapture("user_clicked_family_annual_plan");
  }
  if (
    newValue.title === "Individual" &&
    selectedBillingCycle.value === "monthly"
  ) {
    posthogCapture("user_clicked_individual_monthly_plan");
  }
  if (newValue.title === "Couple" && selectedBillingCycle.value === "monthly") {
    posthogCapture("user_clicked_couple_monthly_plan");
  }
  if (newValue.title === "Family" && selectedBillingCycle.value === "monthly") {
    posthogCapture("user_clicked_family_monthly_plan");
  }
});
</script>

<template>
  <div class="choose-plan-picker">
    <div class="choose-plan-picker__billing-cycle">
      <BaseText
        variant="headline-4-bold"
        as="label"
        class="choose-plan-picker__billing-cycle-label"
      >
        <slot
          name="label"
          :selected-billing-cycle="selectedBillingCycle"
        >
          <template v-if="!!activePlan">Switch plans</template>
          <template v-else>Choose plan</template>
        </slot>
      </BaseText>
      <slot
        name="billing"
        :options="allBillingCycles"
        :modelValue="selectedBillingCycle"
        :onUpdate:modelValue="(value) => (selectedBillingCycle = value)"
      >
        <ButtonToggle
          v-if="allBillingCycles.length"
          v-model="selectedBillingCycle"
          :options="allBillingCycles"
          class="choose-plan-picker__billing-cycle-toggle"
        />
        <div
          v-else
          class="choose-plan-picker__billing-cycle-skeleton"
        />
      </slot>
    </div>
    <fieldset
      v-if="isLoadingPlans"
      class="choose-plan-picker__plans"
    >
      <slot
        name="skeleton"
        :selected-billing-cycle="selectedBillingCycle"
      >
        <ChoosePlanOptionSkeleton type="individual" />
        <ChoosePlanOptionSkeleton type="couple" />
        <ChoosePlanOptionSkeleton type="family" />
      </slot>
    </fieldset>
    <fieldset
      v-else
      class="choose-plan-picker__plans"
    >
      <slot
        v-for="option in billingCycleOptions"
        :key="option.id"
        name="option"
        :modelValue="selectedPlanOptionId"
        :onUpdate:modelValue="(value) => (selectedPlanOptionId = value)"
        :disabled="
          disabled ||
          (option.id === activePlan?.product_id &&
            $store.getters['settings/getSubscription'].owner) ||
          (!$store.getters['settings/getSubscription'].owner &&
            !!option.stripePlan)
        "
        :active="
          store.getters['settings/getSubscription'].owner
            ? option.stripePlan.max_members === activePlan?.max_members &&
              option.stripePlan.recurring_interval ===
                activePlan?.recurring_interval
            : false
        "
        :plan="option.stripePlan"
        :anchor="anchor"
        :discount="discount"
        :compare-at="compareAtPerMemberPrice"
      >
        <ChoosePlanOption
          :key="option.id"
          v-model="selectedPlanOptionId"
          :disabled="
            disabled ||
            (option.id === activePlan?.product_id &&
              $store.getters['settings/getSubscription'].owner) ||
            (!$store.getters['settings/getSubscription'].owner &&
              !!option.stripePlan)
          "
          :active="
            store.getters['settings/getSubscription'].owner
              ? option.stripePlan.max_members === activePlan?.max_members &&
                option.stripePlan.recurring_interval ===
                  activePlan?.recurring_interval
              : false
          "
          :plan="option.stripePlan"
          :anchor="anchor"
          :discount="discount"
          :compare-at="compareAtPerMemberPrice"
        />
      </slot>
    </fieldset>
    <slot name="after" />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.choose-plan-picker {
  &__billing-cycle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    &-toggle {
      flex-shrink: 0;
    }

    &-skeleton {
      height: 40px;
      border-radius: 100px;
      border: 1px solid $color-base-black-10;

      &::before {
        content: "";
        display: block;
        height: 100%;
        width: 50%;
        border-radius: 100px;

        @at-root .theme-dark & {
          @include base-skeleton(
            $color-primary-10-light,
            0.05,
            $color-primary-10-dark,
            0.5
          );
        }

        @at-root .theme-light & {
          @include base-skeleton($color-primary-10);
        }
      }
    }
  }

  &__plans {
    border: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 24px 0;
  }

  &__cta {
    width: 100%;
    position: sticky;
    bottom: 0;
    margin-top: 16px;
    z-index: 101;
  }
}
</style>
