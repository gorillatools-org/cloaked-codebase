import { computed } from "vue";
import store from "@/store";

/**
 * Composable to determine if Cloaked Pay subscription features should be enabled
 * for the current user.
 *
 * Logic:
 * - New users (status "new"): Only need cloaked_pay_enable_subscription flag
 * - Existing users upgrading: Need both cloaked_pay_enable_subscription AND cloaked_pay_offer_upgrade flags
 */
export function useCloakedPaySubscription() {
  const isCloakedPaySubscriptionEnabled = computed(() => {
    const user = store.state.authentication?.user;
    const hasEnableSubscription =
      !!user?.flags?.cloaked_pay_enable_subscription;
    const hasOfferUpgrade = !!user?.flags?.cloaked_pay_offer_upgrade;

    // New users who just subscribed to Cloaked Pay have status "new"
    const isNewCloakedPayUser = user?.cloaked_card_enabled_status === "new";

    // For new Cloaked Pay subscribers: only need enable_subscription flag
    // For existing users upgrading: need both flags
    return isNewCloakedPayUser
      ? hasEnableSubscription
      : hasEnableSubscription && hasOfferUpgrade;
  });

  return {
    isCloakedPaySubscriptionEnabled,
  };
}
