<script setup>
import { computed, toRef } from "vue";
import SubscriptionFamilyPlansBillingStripe from "@/routes/modals/preferences/SubscriptionFamilyPlansBillingStripe.vue";
import SubscriptionFamilyPlansBillingPaypal from "@/routes/modals/preferences/SubscriptionFamilyPlansBillingPaypal.vue";
import SubscriptionFamilyPlansBillingText from "@/routes/modals/preferences/SubscriptionFamilyPlansBillingText.vue";
import SubscriptionFamilyPlansBillingV2 from "@/routes/modals/preferences/SubscriptionFamilyPlansBillingV2.vue";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import store from "@/store";

const props = defineProps({
  activePlan: {
    type: Object,
    default: null,
  },
});

// Create reactive reference to activePlan to maintain reactivity
const activePlan = toRef(props, "activePlan");

const { featureFlag: paymentManagementV2 } = usePostHogFeatureFlag(
  "payment_method_management_v2"
);

// Check if user is the subscription owner
const isOwner = computed(() => {
  return store.getters["settings/getSubscription"]?.owner;
});

// Determine if we should show payment management components
const shouldShowPaymentManagement = computed(() => {
  return isOwner.value;
});
</script>

<template>
  <section>
    <SettingsTitle>Subscription</SettingsTitle>
    <SubscriptionFamilyPlansBillingText :active-plan="activePlan" />
    <template v-if="shouldShowPaymentManagement">
      <!-- For expired users without activePlan, default to stripe/V2 -->
      <template v-if="!activePlan || activePlan.provider === 'stripe'">
        <SubscriptionFamilyPlansBillingV2 v-if="paymentManagementV2" />

        <SubscriptionFamilyPlansBillingStripe
          v-else
          v-bind="$attrs"
        />
      </template>
      <SubscriptionFamilyPlansBillingPaypal
        v-else-if="activePlan.provider === 'paypal'"
        v-bind="$attrs"
      />
    </template>
  </section>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.family-plans-billing-card {
  margin-top: 16px;

  &__actions {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  &__link {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    color: $color-primary-100;

    &:hover {
      opacity: 0.8;
    }
  }

  &__icon {
    height: 12px;
  }
}
</style>
