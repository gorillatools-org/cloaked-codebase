<script setup>
import { computed } from "vue";
import store from "@/store";
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

const isCancelled = computed(() => {
  return store.getters["settings/isCancelled"];
});

const shouldShowBanner = computed(() => {
  if (isCancelled.value) {
    return false;
  }
  return !activePlan.value || planType.value !== "Family";
});

const isWebviewMode = computed(() => store.state.ui.webviewMode);
</script>

<template>
  <div
    class="subscription-family-plans"
    :class="{ 'subscription-family-plans--webview': isWebviewMode }"
  >
    <SubscriptionFamilyPlansBilling
      :active-plan="activePlan"
      @switch-plans="onSwitchPlans"
    />
    <SubscriptionFamilyPlansMembers
      v-if="activePlan?.max_members > 1"
      :active-plan="activePlan"
    />
    <SubscriptionFamilyPlansBanner
      v-if="shouldShowBanner"
      :active-plan="activePlan"
      @upgrade-plan="onUpgradePlan"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.subscription-family-plans {
  max-width: 660px;
  padding: 20px;

  @media all and (min-width: 768px) {
    padding: 40px 80px;
  }

  &--webview {
    padding-top: 70px;

    @media all and (min-width: 768px) {
      padding-top: 70px;
    }
  }
}
</style>
