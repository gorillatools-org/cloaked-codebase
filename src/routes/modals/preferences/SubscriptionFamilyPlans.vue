<script setup>
import SubscriptionFamilyPlansBanner from "@/routes/modals/preferences/SubscriptionFamilyPlansBanner.vue";
import SubscriptionFamilyPlansBilling from "@/routes/modals/preferences/SubscriptionFamilyPlansBilling.vue";
import SubscriptionFamilyPlansMembers from "@/routes/modals/preferences/SubscriptionFamilyPlansMembers.vue";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { usePlansModal } from "@/features/subscribe/composables/usePlansModal";
import { usePlanType } from "@/features/subscribe/composables/usePlanType.js";

const { activePlan } = usePlans();
const planType = usePlanType(activePlan);

const { openPlansModal } = usePlansModal();

const onSwitchPlans = () => openPlansModal();
const onUpgradePlan = () => openPlansModal();
</script>

<template>
  <div class="subscription-family-plans">
    <SubscriptionFamilyPlansBilling
      :active-plan="activePlan"
      @switch-plans="onSwitchPlans"
    />
    <SubscriptionFamilyPlansMembers
      v-if="activePlan?.max_members > 1"
      :active-plan="activePlan"
    />
    <SubscriptionFamilyPlansBanner
      v-if="!activePlan || planType !== 'Family'"
      :active-plan="activePlan"
      @upgrade-plan="onUpgradePlan"
    />
  </div>
</template>

<style lang="scss" scoped>
.subscription-family-plans {
  max-width: 660px;
  padding: 20px;

  @media all and (min-width: 768px) {
    padding: 40px 80px;
  }
}
</style>
