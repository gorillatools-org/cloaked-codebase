import { ref } from "vue";
import SubscriptionService from "@/api/settings/subscription-services";

type TierSubscription = {
  tier_code: string;
  billing_interval: "year" | "month";
  status: "active";
};

const subscription = ref<TierSubscription | null>(null);

export const useTierSubscription = () => {
  const fetchSubscription = async () => {
    try {
      subscription.value = await SubscriptionService.getTierSubscription();
    } catch {
      subscription.value = null;
    }
  };

  return {
    subscription,
    fetchSubscription,
  };
};
