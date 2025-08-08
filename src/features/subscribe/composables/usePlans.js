import { computed } from "vue";
import store from "@/store";

export const usePlans = () => {
  const allPlans = computed(() =>
    (store.getters["subscription/getPlans"] ?? []).sort(
      (a, b) => a.max_members - b.max_members
    )
  );

  const isLoadingPlans = computed(() => !allPlans.value?.length);

  const activeSubscription = computed(() =>
    store.getters["settings/isSubscribed"]
      ? store.getters["settings/getSubscription"]
      : null
  );

  const activePlan = computed(() =>
    activeSubscription.value
      ? {
          product_id: activeSubscription.value.product_identifier,
          max_members: activeSubscription.value.max_members,
          recurring_interval: activeSubscription.value.recurring_interval,
          owner: activeSubscription.value.owner,
          provider: activeSubscription.value.store,
        }
      : null
  );

  return {
    isLoadingPlans,
    allPlans,
    activePlan,
  };
};
