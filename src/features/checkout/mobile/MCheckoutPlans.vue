<script setup lang="ts">
import { computed, inject, toRef } from "vue";
import BaseButton from "@/library/BaseButton.vue";
import MCheckoutPlanCard from "@/features/checkout/mobile/MCheckoutPlanCard.vue";
import { checkoutSessionInjectionKey } from "@/features/checkout/injectionKeys.ts";
import { useCompareAtPrice } from "@/features/checkout/useCompareAtPrice.ts";
import { getPlanType } from "@/features/checkout/utils.ts";
import type { Plan } from "@/features/subscribe/types.ts";

type MCheckoutPlansProps = {
  plans: Plan[];
};

const emit = defineEmits<{
  (e: "select", plan: Plan): void;
  (e: "skip"): void;
}>();

const props = withDefaults(defineProps<MCheckoutPlansProps>(), {
  plans: () => [],
});

const checkoutSession = inject(checkoutSessionInjectionKey);

// Compare-at price for savings calculation
const compareAtPrice = useCompareAtPrice(toRef(() => props.plans));

// The individual plan for the current billing cycle - used as the base for price comparisons
const individualPlan = computed(() => {
  if (!checkoutSession?.billing) {
    return null;
  }

  return (
    props.plans.find(
      (plan) =>
        plan.provider === "stripe" &&
        plan.recurring_interval === checkoutSession.billing &&
        plan.max_members === 1
    ) ?? null
  );
});

// Filter only multi-member plans matching the current billing cycle
const multiMemberPlans = computed(() => {
  if (!checkoutSession?.billing) {
    return [];
  }

  return props.plans
    .filter(
      (plan) =>
        plan.recurring_interval === checkoutSession.billing &&
        plan.max_members > 1 &&
        plan.provider === "stripe"
    )
    .sort((a, b) => a.max_members - b.max_members);
});
</script>

<template>
  <div class="checkout-plans">
    <div class="checkout-plans__cards">
      <MCheckoutPlanCard
        v-for="plan in multiMemberPlans"
        :key="plan.product_id"
        :plan="plan"
        :individual-plan="individualPlan"
        :compare-at-price="compareAtPrice"
        :selected="
          getPlanType(plan) === (checkoutSession?.plan || 'individual')
        "
        @select="emit('select', $event)"
      />
    </div>

    <BaseButton
      class="checkout-plans__button"
      size="lg"
      full-width
      @click="emit('skip')"
    >
      Continue with individual plan
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.checkout-plans {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__button {
    margin-top: 8px;
  }
}
</style>
