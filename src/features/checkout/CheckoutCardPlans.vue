<script setup lang="ts">
import { computed, inject, toRef, toValue } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutTabs from "@/features/checkout/CheckoutTabs.vue";
import CheckoutPlan from "@/features/checkout/CheckoutPlan.vue";
import { usePlans } from "@/features/checkout/usePlans.ts";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.ts";
import { findMostExpensivePlan } from "@/features/subscribe/composables/usePlanComparisonPrice.ts";
import { checkoutSessionInjectionKey } from "@/features/checkout/injectionKeys.ts";
import type { Plan, PlanBilling } from "@/features/subscribe/types.ts";

type CheckoutCardPlansProps = {
  plans: Plan[];
};

const props = withDefaults(defineProps<CheckoutCardPlansProps>(), {
  plans: () => [],
});

const checkoutSession = inject(checkoutSessionInjectionKey);

const { stripePlans } = usePlans(toRef(() => props.plans));

const billingPlans = computed(() =>
  toValue(stripePlans).filter(
    (plan) => plan.recurring_interval === checkoutSession?.billing
  )
);

const mostExpensivePlan = computed(
  () =>
    findMostExpensivePlan(props.plans, "monthly") ??
    findMostExpensivePlan(props.plans, "annually") ??
    findMostExpensivePlan(props.plans, "2-yearly")
);

const compareAt = usePlanPrice(mostExpensivePlan, "per-member-monthly");

type BillingOption = {
  value: PlanBilling;
  label: string;
};

const billingOptions: BillingOption[] = [
  { value: "annually", label: "Annual" },
  { value: "monthly", label: "Monthly" },
];
</script>

<template>
  <BaseSheet
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    class="checkout-card-plans"
  >
    <CheckoutTitle>Select plan</CheckoutTitle>
    <CheckoutTabs
      v-if="checkoutSession"
      v-model="checkoutSession.billing"
      :options="billingOptions"
      :disabled="!!checkoutSession?.status || !!checkoutSession?.isPaid"
      class="checkout-card-plans__tabs"
    />
    <ul class="checkout-card-plans__plans">
      <li
        v-for="plan in billingPlans"
        :key="plan.product_id"
      >
        <CheckoutPlan
          :plan="plan"
          :compare-at="compareAt"
          :disabled="!!checkoutSession?.status || !!checkoutSession?.isPaid"
        />
      </li>
    </ul>
  </BaseSheet>
</template>

<style lang="scss" scoped>
.checkout-card-plans {
  &__tabs {
    margin-top: 10px;
  }

  &__plans {
    display: grid;
    gap: 8px;
    margin-top: 16px;
  }
}
</style>
