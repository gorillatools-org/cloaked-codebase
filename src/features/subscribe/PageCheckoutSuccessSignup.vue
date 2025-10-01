<script setup>
import PageCheckoutSuccessRecovery from "@/features/subscribe/PageCheckoutSuccessRecovery.vue";
import PageCheckoutSuccessPasswordless from "@/features/subscribe/PageCheckoutSuccessPasswordless.vue";
import PageCheckoutSubscriptionStarted from "@/features/subscribe/PageCheckoutSubscriptionStarted.vue";
import { onBeforeMount, ref, computed, onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_SIGNUP_SUCCESS_SCREEN } from "@/scripts/posthogEvents.js";
import { useRouter } from "vue-router";
import store from "@/store";

const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
});

const showSubscriptionStarted = ref(true);
const router = useRouter();

const hasPassword = computed(() => {
  return !!props.account.password;
});

const onSuccessRecoveryContinue = async () => {
  // Check if user subscribed to a Cloaked Pay plan using store's collected plans
  const subscription = store.getters["settings/getSubscription"];

  // Check if user subscribed to a Cloaked Pay plan
  if (subscription?.product_identifier) {
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
  <PageCheckoutSubscriptionStarted
    v-if="hasPassword && showSubscriptionStarted"
    @continue="showSubscriptionStarted = false"
  />
  <PageCheckoutSuccessRecovery
    v-else-if="hasPassword"
    :account="account"
    @continue="onSuccessRecoveryContinue"
  />
  <PageCheckoutSuccessPasswordless
    v-else
    :account="account"
  />
</template>
