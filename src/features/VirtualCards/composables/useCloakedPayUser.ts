import { computed } from "vue";
import store from "@/store";
import { EDDBehaviorEnum } from "@/types/Wallet/kyc";
import { useCloakedPaySubscription } from "@/features/VirtualCards/composables/useCloakedPaySubscription";

export function useCloakedPayUser() {
  const { isExistingUserSubscriptionEnabled } = useCloakedPaySubscription();

  const user = computed(() => {
    return store.state.authentication?.user;
  });

  const isOnboardingCompleted = computed(() => {
    return !!user.value?.cloaked_card_post_kyc_onboarding_completed;
  });

  const eddState = computed(() => {
    return user?.value?.edd_state || null;
  });

  const isEnabled = computed(() => {
    return (
      !!user?.value?.cloaked_card_enabled ||
      user?.value?.cloaked_card_enabled_status === "enabled"
    );
  });

  const enabledStatus = computed(() => {
    return user?.value?.cloaked_card_enabled_status;
  });

  const isDisabledUserDowngraded = computed(() => {
    return enabledStatus.value === "disabled_userdowngraded";
  });

  const isKycRejected = computed(() => {
    return (
      user.value?.kyc_limit_reached ||
      eddState.value?.behavior === EDDBehaviorEnum.REJECT_KYC
    );
  });

  const isKycValidated = computed(() => {
    return !!user.value?.cloaked_card_kyc_configured;
  });

  const isUserOnboarded = computed(() => {
    return !!user.value?.cloaked_card_onboarded;
  });

  const subscriptionStatus = computed(() => {
    return user.value?.cloaked_card_subscription_intent_status || null;
  });

  const isPayFlowPending = computed(() => {
    if (!isExistingUserSubscriptionEnabled.value) {
      return false;
    }

    if (
      enabledStatus.value === "disabled" ||
      enabledStatus.value === "disabled_userdowngraded"
    ) {
      return false;
    }

    if (isKycRejected.value && !isKycValidated.value) {
      return false;
    }

    if (
      enabledStatus.value === "new" ||
      enabledStatus.value === "new_upgrading" ||
      enabledStatus.value === null
    ) {
      return true;
    }

    if (enabledStatus.value === "enabled") {
      return isOnboardingCompleted.value === false;
    }

    return false;
  });

  return {
    user,
    isEnabled,
    isKycValidated,
    isKycRejected,
    isOnboardingCompleted,
    eddState,
    enabledStatus,
    isDisabledUserDowngraded,
    isUserOnboarded,
    subscriptionStatus,
    isPayFlowPending,
  };
}
