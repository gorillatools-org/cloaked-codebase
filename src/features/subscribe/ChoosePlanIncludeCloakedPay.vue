<script setup lang="ts">
import CheckoutCard from "@/features/subscribe/components/CheckoutCard.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";
import BaseToggle from "@/library/BaseToggle.vue";
import { usePlanOptions } from "@/features/subscribe/composables/usePlanOptions.ts";
import type { PlanBilling } from "./types";
import { computed, toRef } from "vue";
import { usePlanType } from "./composables/usePlanType";
import { usePlanBilling } from "./composables/usePlanBilling";
import { usePlans } from "./composables/usePlans";
import { formattedPrice } from "./composables/utils";
import { usePlanPrice } from "./composables/usePlanPrice";

const features: string[] = [
  "Virtual cards with customizable spend controls",
  "Merchant masking to protect your identity",
  "Full rewards passthrough from your real cards",
  "Instant transaction notifications and controls",
];

const props = defineProps<{
  billingCycle: PlanBilling;
}>();

const model = defineModel({ type: Boolean, default: false });

const { allPlans: defaultPlans } = usePlans("all");
const { allPlans: cloakedPayPlans } = usePlans("cloaked_pay");

const { selectedPlanOption } = usePlanOptions({
  selectedBillingCycle: toRef(() => props.billingCycle),
  planProduct: toRef(() => (model.value ? "cloaked_pay" : "all")),
});

const planTitle = computed(() => {
  if (!selectedPlanOption.value) {
    return "";
  }

  const type = usePlanType(selectedPlanOption.value.stripePlan);
  const billing = usePlanBilling(selectedPlanOption.value.stripePlan);

  return `${type.value === "Individual" ? "" : type.value} ${billing.value}`;
});

const deltaPrice = computed(() => {
  if (!selectedPlanOption.value) {
    return 0;
  }

  const selectedPlanMembers =
    selectedPlanOption.value.stripePlan.max_members || 1;
  const interval = selectedPlanOption.value.stripePlan.recurring_interval;

  const defaultPlan = defaultPlans.value.find(
    (plan) =>
      plan.max_members === selectedPlanMembers &&
      plan.recurring_interval === interval
  );
  const cloakedPayPlan = cloakedPayPlans.value.find(
    (plan) =>
      plan.max_members === selectedPlanMembers &&
      plan.recurring_interval === interval
  );

  if (defaultPlan && cloakedPayPlan) {
    return (
      (usePlanPrice(cloakedPayPlan, "monthly").value ?? 0) -
      (usePlanPrice(defaultPlan, "monthly").value ?? 0)
    );
  }

  return 0;
});
</script>

<template>
  <CheckoutCard
    class="choose-plan-include-pay"
    :class="{ 'choose-plan-include-pay--expanded': model }"
    rounding="sm"
  >
    <div class="choose-plan-include-pay__content">
      <div class="choose-plan-include-pay__infos-container">
        <div class="choose-plan-include-pay__icon-container">
          <BaseIcon
            name="wallet-filled"
            class="choose-plan-include-pay__icon"
          />
        </div>
        <div class="choose-plan-include-pay__infos-texts-container">
          <BaseText
            variant="headline-5-bold"
            class="choose-plan-include-pay__infos-title"
          >
            Add Cloaked Pay
          </BaseText>
          <BaseText
            variant="body-3-regular"
            class="choose-plan-include-pay__infos-description"
          >
            Add privacy-first payment protection to any plan.
          </BaseText>
        </div>
      </div>
      <div class="choose-plan-include-pay__switch-container">
        <div
          v-if="!deltaPrice"
          class="choose-plan-include-pay__switch-price-skeleton"
        ></div>
        <BaseText
          v-else
          variant="headline-5-bold"
          class="choose-plan-include-pay__switch-price"
        >
          +{{ formattedPrice(deltaPrice) }}/mo
        </BaseText>
        <BaseToggle
          class="choose-plan-include-pay__switch-toggle"
          :active="model"
          @click="model = !model"
        />
      </div>
    </div>
    <div class="choose-plan-include-pay__features-container">
      <div class="choose-plan-include-pay__features-wrapper">
        <BaseText
          variant="headline-6-bold"
          class="choose-plan-include-pay__features-title"
        >
          Enhanced payment security for your {{ planTitle }} subscription:
        </BaseText>
        <ul class="choose-plan-include-pay__features-list">
          <li
            v-for="(feature, index) in features"
            :key="index"
            class="choose-plan-include-pay__features-item"
          >
            <BaseIcon
              name="check"
              class="choose-plan-include-pay__features-item-icon"
            />
            <BaseText
              variant="body-2-semibold"
              class="choose-plan-include-pay__features-item-text"
            >
              {{ feature }}
            </BaseText>
          </li>
        </ul>
      </div>
    </div>
  </CheckoutCard>
</template>

<style lang="scss" scoped>
.choose-plan-include-pay {
  padding: 16px;
  border: 1px solid transparent;
  transition: border 0.2s ease-out;
  gap: 0;

  &--expanded {
    border: 1px solid $color-primary-100;
  }

  &__content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  &__infos {
    &-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &-texts-container {
      display: flex;
      flex-direction: column;
    }

    &-description {
      color: $color-primary-70;
      margin-top: 2px;
      font-size: 13px;
    }
  }

  &__icon {
    font-size: 19px;

    &-container {
      width: 34px;
      min-width: 34px;
      height: 34px;
      min-height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: $color-gradient-purple;
    }
  }

  &__switch {
    &-container {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 12px;
    }

    &-price {
      color: $color-primary-100;

      &-skeleton {
        padding: 8px 16px;
        border-radius: 8px;
        height: 21px;
        width: 80px;

        @at-root .theme-dark & {
          @include base-skeleton(
            $color-primary-10-light,
            0.05,
            $color-primary-10-dark,
            0.5
          );
        }

        @at-root .theme-light & {
          @include base-skeleton($color-primary-20);
        }
      }
    }

    &-toggle {
      scale: 1.1;
    }
  }

  &__features {
    &-container {
      overflow: hidden;
      transition:
        max-height 0.2s ease-out,
        opacity 0.25s ease-out;
      max-height: 0;
      opacity: 0;

      .choose-plan-include-pay--expanded & {
        max-height: 300px;
        opacity: 1;
      }
    }

    &-wrapper {
      display: flex;
      flex-direction: column;
      border-top: 1px solid $color-base-black-15;
      padding-top: 16px;
      margin-top: 16px;
    }

    &-title {
      font-size: 15px;
    }

    &-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    &-item {
      display: flex;
      align-items: center;
      gap: 8px;

      &-icon {
        font-size: 16px;
      }

      &-text {
        font-size: 15px;
        color: $color-base-black-80;
        font-weight: 500;
      }
    }
  }
}
</style>
