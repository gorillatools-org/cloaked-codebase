import { computed } from "vue";
import store from "@/store";

export function useCloakedPaySubscription() {
  const user = computed(() => {
    return store.state.authentication?.user;
  });

  /**
   * Computed property to determine if Cloaked Pay subscription features should be enabled
   * for the current user.
   *
   * Logic:
   * - New users (status "new"): Only need cloaked_pay_enable_subscription flag
   * - Existing users upgrading: Need both cloaked_pay_enable_subscription AND cloaked_pay_offer_upgrade flags
   */
  const isCloakedPaySubscriptionEnabled = computed(() => {
    const hasEnableSubscription =
      !!user.value?.flags?.cloaked_pay_enable_subscription;
    const hasOfferUpgrade = !!user.value?.flags?.cloaked_pay_offer_upgrade;

    // New users who just subscribed to Cloaked Pay have status "new"
    const isNewCloakedPayUser =
      user.value?.cloaked_card_enabled_status === "new";

    // For new Cloaked Pay subscribers: only need enable_subscription flag
    // For existing users upgrading: need both flags
    return isNewCloakedPayUser
      ? hasEnableSubscription
      : hasEnableSubscription && hasOfferUpgrade;
  });

  const isExistingUserSubscriptionEnabled = computed(() => {
    const hasEnableSubscription =
      !!user.value?.flags?.cloaked_pay_enable_subscription;
    const hasOfferUpgrade = !!user.value?.flags?.cloaked_pay_offer_upgrade;

    return hasEnableSubscription && hasOfferUpgrade;
  });

  const isSubscribedToCloakedPay = computed(() => {
    return user.value?.cloaked_card_has_cloaked_pay_subscription_plan;
  });

  return {
    isCloakedPaySubscriptionEnabled,
    isExistingUserSubscriptionEnabled,
    isSubscribedToCloakedPay,
  };
}
