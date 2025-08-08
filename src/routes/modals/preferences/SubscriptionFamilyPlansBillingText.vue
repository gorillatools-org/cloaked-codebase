<script setup>
import { toRef, computed } from "vue";
import store from "@/store";
import { useFormattedDate } from "@/composables/useFormattedDate";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  activePlan: {
    type: Object,
    default: null,
  },
});

const planType = usePlanType(toRef(() => props.activePlan));

const subscriptionEndDate = useFormattedDate(
  toRef(() =>
    store.getters["settings/getSubscription"]?.canceled_at
      ? store.getters["settings/getSubscription"]?.expires_date
      : null
  )
);

const subscriptionCancelReason = computed(() => {
  return store.getters["settings/getSubscription"]?.reason_for_cancellation;
});

const cancelledDisplayText = computed(() => {
  switch (subscriptionCancelReason.value) {
    case "removed_from_bulk_plan":
      return "You have been removed from a managed Cloaked plan";
    case "voluntary_cancellation":
      return "Your managed Cloaked plan has been cancelled";
    case "plan_expired":
    default:
      return "Your managed Cloaked plan has expired";
  }
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
    {{ cancelledDisplayText }}. You are on a limited plan.
  </BaseText>
  <BaseText
    v-else-if="$store.getters['settings/getSubscription'].owner"
    as="p"
    variant="body-2-semibold"
    class="family-plans-billing-text"
  >
    <template v-if="subscriptionEndDate">
      You are on a Cloaked {{ planType }} plan. Your subscription will expire on
      {{ subscriptionEndDate }}.
    </template>
    <template v-else-if="activePlan.recurring_interval">
      You are on a Cloaked {{ planType }} plan, billed
      {{
        activePlan.recurring_interval === "2-yearly"
          ? "every 2 years"
          : activePlan.recurring_interval
      }}.
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
