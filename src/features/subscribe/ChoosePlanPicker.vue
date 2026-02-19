<script setup lang="ts">
import { computed } from "vue";
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
import type {
  PlanBilling,
  PlanOption,
  PlanProduct,
} from "@/features/subscribe/types.ts";

export type ChoosePlanPickerProps = {
  disabled?: boolean;
  discount?: number | null;
  anchor?: number | null;
};

withDefaults(defineProps<ChoosePlanPickerProps>(), {
  disabled: false,
  discount: null,
  anchor: null,
  planProduct: "all",
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

const billingCycle = defineModel<PlanBilling>("billingCycle", {
  default: "annually",
});

const planProduct = defineModel<PlanProduct>("planProduct", {
  default: "all",
});

const compareAtPerMemberPrice = usePlanComparisonPrice(undefined, planProduct);

const { activePlan, isLoadingPlans } = usePlans(planProduct);

const billingOptions = useBillingOptions();

const { billingCycleOptions, selectedPlanOptionId } = usePlanOptions({
  selectedBillingCycle: billingCycle,
  planProduct,
});

onMounted(() => {
  posthogCapture("user_clicked_period_toggle", {
    billing_period: billingCycle.value,
  });
});

watch(billingCycle, (newValue) => {
  posthogCapture("user_clicked_period_toggle", { billing_period: newValue });
});

// Smooth parent height animation for list swaps
const onBeforeEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = element.offsetHeight + "px";
  element.style.opacity = "0";
};

const onEnter = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  requestAnimationFrame(() => {
    element.style.height = element.scrollHeight + "px";
    element.style.opacity = "1";
  });

  const onEnd = () => {
    element.style.height = "";
    element.style.transition = "";
    element.removeEventListener("transitionend", onEnd);
    done();
  };

  element.addEventListener("transitionend", onEnd);
};

const onLeave = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.height = element.offsetHeight + "px";
  requestAnimationFrame(() => {
    element.style.height = "0px";
    element.style.opacity = "0";
  });
  element.addEventListener("transitionend", () => done(), { once: true });
};

const isFamily3Plan = (plan: any) => {
  const members = plan?.max_members ?? plan?.members ?? plan?.member_count;
  if (members === 3) return true;

  const id = String(plan?.product_id ?? "").toLowerCase();
  if (
    id.includes("family-3") ||
    id.includes("family_3") ||
    id.includes("family3")
  )
    return true;

  return false;
};

// If family-3 is coming this filters that out :) - we are doing that intentionanly in our older picker
const filteredBillingCycleOptions = computed(() =>
  billingCycleOptions.value.filter((opt) => !isFamily3Plan(opt.stripePlan))
);

const user = computed(() => {
  return store.state.authentication.user;
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
      v-if="!user || isLoadingPlans"
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
      <Transition
        mode="out-in"
        @before-enter="onBeforeEnter"
        @enter="onEnter"
        @leave="onLeave"
      >
        <div
          :key="planProduct"
          class="choose-plan-picker__plans-wrapper"
        >
          <slot
            v-for="option in filteredBillingCycleOptions"
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
        </div>
      </Transition>
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

  &__plans-wrapper {
    overflow: hidden;
    transition:
      height 270ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 220ms ease;
    display: flex;
    flex-direction: column;
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
