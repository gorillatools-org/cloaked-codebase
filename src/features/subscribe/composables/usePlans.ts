import { computed } from "vue";
import store from "@/store";
import { type Plan, type Subscription } from "@/features/subscribe/types.ts";

export const usePlans = () => {
  const allPlans = computed<Plan[]>(() =>
    ((store.getters["subscription/getPlans"] ?? []) as Plan[]).sort(
      (a, b) => a.max_members - b.max_members
    )
  );

  const isLoadingPlans = computed(() => !allPlans.value?.length);

  const activeSubscription = computed<Subscription | null>(() =>
    store.getters["settings/isSubscribed"]
      ? store.getters["settings/getSubscription"]
      : null
  );

  const activePlan = computed(() => {
    if (activeSubscription.value) {
      const usersPlan: Plan | undefined = allPlans.value.find(
        (plan) =>
          plan.product_id === activeSubscription.value?.product_identifier
      );
      return {
        product_id: activeSubscription.value.product_identifier,
        max_members: activeSubscription.value.max_members,
        recurring_interval: activeSubscription.value.recurring_interval,
        owner: activeSubscription.value.owner,
        provider: activeSubscription.value.store,
        price: usersPlan?.price,
      };
    }
    return null;
  });

  return {
    isLoadingPlans,
    allPlans,
    activePlan,
  };
};
