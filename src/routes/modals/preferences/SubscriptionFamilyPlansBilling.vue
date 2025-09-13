<script setup>
import SubscriptionFamilyPlansBillingStripe from "@/routes/modals/preferences/SubscriptionFamilyPlansBillingStripe.vue";
import SubscriptionFamilyPlansBillingPaypal from "@/routes/modals/preferences/SubscriptionFamilyPlansBillingPaypal.vue";
import SubscriptionFamilyPlansBillingText from "@/routes/modals/preferences/SubscriptionFamilyPlansBillingText.vue";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";

defineProps({
  activePlan: {
    type: Object,
    default: null,
  },
});
</script>

<template>
  <section>
    <SettingsTitle>Subscription</SettingsTitle>
    <SubscriptionFamilyPlansBillingText :active-plan="activePlan" />
    <template
      v-if="activePlan && $store.getters['settings/getSubscription'].owner"
    >
      <SubscriptionFamilyPlansBillingStripe
        v-if="activePlan.provider === 'stripe'"
        v-bind="$attrs"
      />
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
    // font-size: 15px;
    // font-style: normal;
    // font-weight: 600;
    // line-height: normal;
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
