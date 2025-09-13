<script setup lang="ts">
import ButtonToggle from "@/features/ButtonToggle.vue";
import ChoosePlanOption, {
  type ChoosePlanOptionProps,
} from "@/features/subscribe/ChoosePlanOption.vue";
import ChoosePlanOptionSkeleton from "@/features/subscribe/ChoosePlanOptionSkeleton.vue";
import { watch, onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { useBillingOptions } from "@/features/subscribe/composables/useBillingOptions.ts";
import { usePlanOptions } from "@/features/subscribe/composables/usePlanOptions";
import { usePlanComparisonPrice } from "@/features/subscribe/composables/usePlanComparisonPrice.js";
import store from "@/store/index.js";
import BaseText from "@/library/BaseText.vue";
import CheckoutCard from "@/features/subscribe/components/CheckoutCard.vue";
import type { PlanBilling, PlanOption } from "@/features/subscribe/types.ts";

type ChoosePlanPickerProps = {
  disabled?: boolean;
  discount?: number | null;
  anchor?: number | null;
};

withDefaults(defineProps<ChoosePlanPickerProps>(), {
  disabled: false,
  discount: null,
  anchor: null,
});

defineSlots<{
  label(props: { selectedBillingCycle: PlanBilling }): any;
  skeleton(props: { selectedBillingCycle: PlanBilling }): any;
  option(
    props: ChoosePlanOptionProps & {
      key: string;
      modelValue: PlanOption["id"] | null;
      "onUpdate:modelValue": (value: PlanOption["id"] | null) => void;
    }
  ): any;
  after(): any;
}>();

const compareAtPerMemberPrice = usePlanComparisonPrice();

const { activePlan, isLoadingPlans } = usePlans();

const billingOptions = useBillingOptions();

const billingCycle = defineModel<PlanBilling>("billingCycle", {
  default: "annually",
});

const { billingCycleOptions, selectedPlanOptionId } = usePlanOptions({
  selectedBillingCycle: billingCycle,
});

onMounted(() => {
  posthogCapture("user_clicked_period_toggle", {
    billing_period: billingCycle.value,
  });
});

watch(billingCycle, (newValue) => {
  posthogCapture("user_clicked_period_toggle", { billing_period: newValue });
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
          :selected-billing-cycle="billingCycle"
        >
          <template v-if="!!activePlan">Switch plans</template>
          <template v-else>Choose plan</template>
        </slot>
      </BaseText>
      <ButtonToggle
        v-if="billingOptions.length"
        v-model="billingCycle"
        :options="billingOptions"
        class="choose-plan-picker__billing-cycle-toggle"
      />
      <div
        v-else
        class="choose-plan-picker__billing-cycle-skeleton"
      />
    </div>
    <CheckoutCard
      v-if="isLoadingPlans"
      class="choose-plan-picker__plans"
      rounding="sm"
    >
      <slot
        name="skeleton"
        :selected-billing-cycle="billingCycle"
      >
        <ChoosePlanOptionSkeleton type="individual" />
        <ChoosePlanOptionSkeleton type="couple" />
        <ChoosePlanOptionSkeleton type="family" />
      </slot>
    </CheckoutCard>
    <CheckoutCard
      v-else
      class="choose-plan-picker__plans"
      rounding="sm"
    >
      <slot
        v-for="option in billingCycleOptions"
        :key="option.id"
        name="option"
        :model-value="selectedPlanOptionId"
        :on-update:model-value="(value) => (selectedPlanOptionId = value)"
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
    </CheckoutCard>
    <slot name="after" />
  </div>
</template>

<style lang="scss" scoped>
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
    margin: 24px 0 0;
    row-gap: 8px;
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
