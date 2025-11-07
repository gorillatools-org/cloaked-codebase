<script setup>
import { toRef, computed } from "vue";
import store from "@/store";
import { useFormattedDate } from "@/composables/useFormattedDate";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import { usePlans } from "@/features/subscribe/composables/usePlans.ts";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  activePlan: {
    type: Object,
    default: null,
  },
});

const planType = usePlanType(toRef(() => props.activePlan));

// Get all available plans for price lookup
const { allPlans } = usePlans();

const subscriptionEndDate = useFormattedDate(
  toRef(() => store.getters["settings/getSubscription"]?.expires_date)
);

const isCancelled = computed(() => {
  return (
    store.getters["settings/getSubscription"]?.state === "CANCELED" ||
    store.getters["settings/getSubscription"]?.canceled_at !== null
  );
});

// Get subscription data for expired users
const expiredSubscription = computed(() => {
  return store.getters["settings/getSubscription"];
});

// Format expired plan details
const expiredPlanText = computed(() => {
  if (!expiredSubscription.value) {
    return "You are on a limited plan.";
  }

  const planTitle = expiredSubscription.value.product_plan_title || "Cloaked";
  const interval = expiredSubscription.value.recurring_interval;

  // Try to get price from subscription data first
  let price = expiredSubscription.value.product_price;

  // If no price in subscription, try to find it from available plans using product_identifier
  if (!price && expiredSubscription.value.product_identifier) {
    const matchingPlan = allPlans.value.find(
      (plan) => plan.product_id === expiredSubscription.value.product_identifier
    );
    price = matchingPlan?.price;
  }

  let priceText = "";
  if (price && interval) {
    const formattedPrice = (price / 100).toFixed(2);
    priceText = ` for $${formattedPrice}${interval === "annually" ? "/year" : "/month"}`;
  } else if (price) {
    // Fallback if no interval info
    const formattedPrice = (price / 100).toFixed(2);
    priceText = ` for $${formattedPrice}`;
  }

  return `You were on a ${planTitle} plan${priceText}. Reactivate to restore access.`;
});

const planPriceText = computed(() => {
  if (props.activePlan?.price) {
    return ` for $${props.activePlan?.price / 100}`;
  }
  return "";
});
</script>

<template>
  <BaseText
    v-if="$store.getters['settings/isLegacy']"
    as="p"
    variant="body-2-semibold"
    class="family-plans-billing-text"
  >
    You are on a Cloaked Premium plan.
  </BaseText>
  <BaseText
    v-else-if="$store.getters['settings/isTrial']"
    as="p"
    variant="body-2-semibold"
    class="family-plans-billing-text"
  >
    You are on a free trial.
  </BaseText>
  <BaseText
    v-else-if="!activePlan"
    as="p"
    variant="body-2-semibold"
    class="family-plans-billing-text"
  >
    {{ expiredPlanText }}
  </BaseText>
  <BaseText
    v-else-if="$store.getters['settings/getSubscription'].owner"
    as="p"
    variant="body-2-semibold"
    class="family-plans-billing-text"
  >
    <template v-if="isCancelled">
      You are on a Cloaked {{ planType }} plan. Your subscription will expire on
      {{ subscriptionEndDate }}.
    </template>
    <template v-else-if="activePlan.recurring_interval">
      You are on a Cloaked {{ planType }} plan. Your subscription is set to
      renew on {{ subscriptionEndDate }}{{ planPriceText }}.
    </template>
    <template v-else>You are on a Cloaked {{ planType }} plan.</template>
  </BaseText>
  <BaseText
    v-else
    as="p"
    variant="body-2-semibold"
  >
    You are on a Cloaked {{ planType }} plan. Your subscription is paid and
    managed by another Cloaked member. You may leave this plan anytime.
  </BaseText>
</template>

<style lang="scss" scoped>
.family-plans-billing-text {
  margin-top: 16px;
  color: $color-primary-100;
}
</style>
