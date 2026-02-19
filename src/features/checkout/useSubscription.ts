import { ref } from "vue";
import SubscriptionService from "@/api/settings/subscription-services";
import type { Subscription } from "@/features/subscribe/types.ts";

const subscription = ref<Subscription | null>(null);

export const useSubscription = () => {
  const fetchSubscription = async (): Promise<Subscription | null> => {
    try {
      subscription.value = await SubscriptionService.getSubscription();
    } catch {
      subscription.value = null;
    }

    return subscription.value;
  };

  const pollSubscription = async (
    targetState: Subscription["state"]
  ): Promise<Subscription | null> => {
    const attempts = 10;
    const interval = 300;

    for (let i = 1; i <= attempts; i++) {
      try {
        const subscription = await fetchSubscription();

        if (subscription?.state === targetState || i === attempts) {
          return subscription;
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error) {
        console.error(error);
      }
    }

    return subscription.value;
  };

  return {
    subscription,
    fetchSubscription,
    pollSubscription,
  };
};
