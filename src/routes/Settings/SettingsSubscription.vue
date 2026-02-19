<script setup>
import SubscriptionFamilyPlans from "@/routes/modals/preferences/SubscriptionFamilyPlans.vue";
import { onBeforeMount } from "vue";
import SubscriptionService from "@/api/settings/subscription-services";
import store from "@/store";

onBeforeMount(() => {
  // NOTE: purposefully querying backend every time in case user makes to stripe
  SubscriptionService.getStripeInfo();
  store.dispatch("subscription/init");
  store.dispatch("subscription/fetchInvitations");
});
</script>

<template>
  <SubscriptionFamilyPlans />
</template>
