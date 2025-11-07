<script setup>
import PageCheckoutSuccessRecovery from "@/features/subscribe/PageCheckoutSuccessRecovery.vue";
import PageCheckoutSuccessPasswordless from "@/features/subscribe/PageCheckoutSuccessPasswordless.vue";
import { onBeforeMount, computed, onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_SIGNUP_SUCCESS_SCREEN } from "@/scripts/posthogEvents.js";
import { useRouter } from "vue-router";
import store from "@/store";

const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
  isCloakedPayCustomerRoute: {
    type: Boolean,
    required: true,
  },
});

const router = useRouter();

const hasPassword = computed(() => {
  return !!props.account.password;
});

const onPageCheckoutSuccessContinue = async () => {
  // Check if user subscribed to a Cloaked Pay plan using store's collected plans
  const subscription = store.getters["settings/getSubscription"];

  // Check if user subscribed to a Cloaked Pay plan
  if (subscription?.product_identifier && props.isCloakedPayCustomerRoute) {
    const cloakedPayPlans = store.getters["subscription/getPayPlans"] || [];
    const isCloakedPayPlan = cloakedPayPlans.some(
      (plan) => plan.product_id === subscription.product_identifier
    );

    if (isCloakedPayPlan) {
      store.dispatch("cloakedPayOnboarding/enableOnboarding");
      await router.push({ name: "CloakedPaySubscriptionOnboarding" });
      return;
    }
  }

  await router.push({ name: "Home" });
};

onBeforeMount(() =>
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_SIGNUP_SUCCESS_SCREEN)
);

onMounted(() => posthogCapture("user_signed_up"));
</script>

<template>
  <PageCheckoutSuccessRecovery
    v-if="hasPassword"
    :account="account"
    @continue="onPageCheckoutSuccessContinue"
  />
  <PageCheckoutSuccessPasswordless
    v-else
    :account="account"
    :is-cloaked-pay-onboarding="isCloakedPayCustomerRoute"
    @continue="onPageCheckoutSuccessContinue"
  />
</template>
