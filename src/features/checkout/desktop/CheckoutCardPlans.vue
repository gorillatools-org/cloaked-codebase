<script setup lang="ts">
import { computed, inject, toRef, toValue } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutTabs from "@/features/checkout/CheckoutTabs.vue";
import CheckoutPlan from "@/features/checkout/CheckoutPlan.vue";
import { usePlans } from "@/features/checkout/usePlans.ts";
import { useCompareAtPrice } from "@/features/checkout/useCompareAtPrice.ts";
import { checkoutSessionInjectionKey } from "@/features/checkout/injectionKeys.ts";
import type { Plan, PlanBilling } from "@/features/subscribe/types.ts";
import { isFamily3Plan } from "../utils";

type CheckoutCardPlansProps = {
  plans: Plan[];
  hideTitle?: boolean;
};

const props = withDefaults(defineProps<CheckoutCardPlansProps>(), {
  plans: () => [],
  hideTitle: false,
});

const checkoutSession = inject(checkoutSessionInjectionKey);

const { stripePlans } = usePlans(toRef(() => props.plans));

const compareAtPrice = useCompareAtPrice(toRef(() => props.plans));

const billingOptions: { value: PlanBilling; label: string }[] = [
  { value: "annually", label: "Annual" },
  { value: "monthly", label: "Monthly" },
];

const billingPlans = computed(() =>
  toValue(stripePlans)
    .filter(
      (plan) =>
        plan.recurring_interval === checkoutSession?.billing &&
        !isFamily3Plan(plan)
    )
    .sort((a, b) => a.max_members - b.max_members)
);

const isDisabled = computed(
  () => !!checkoutSession?.status || !!checkoutSession?.isPaid
);
</script>

<template>
  <div class="checkout-card-plans">
    <CheckoutTitle v-if="!hideTitle">Select plan</CheckoutTitle>
    <CheckoutTabs
      v-if="checkoutSession && checkoutSession.billing"
      v-model="checkoutSession.billing"
      :options="billingOptions"
      :disabled="isDisabled"
      class="checkout-card-plans__tabs"
    />
    <BaseSheet
      v-if="billingPlans.length"
      elevation="md"
      rounding="sm"
      class="checkout-card-plans__card"
    >
      <ul class="checkout-card-plans__plans">
        <li
          v-for="plan in billingPlans"
          :key="plan.product_id"
        >
          <CheckoutPlan
            :plan="plan"
            :compare-at-price="compareAtPrice"
            :disabled="isDisabled"
          />
        </li>
      </ul>
    </BaseSheet>
  </div>
</template>

<style lang="scss" scoped>
.checkout-card-plans {
  &__tabs {
    margin-top: 16px;
  }

  &__card {
    background: $color-base-black-5;
    border: none;
    margin-top: 16px;
    padding: 8px;
  }

  &__plans {
    display: grid;
    gap: 4px;
  }
}
</style>
