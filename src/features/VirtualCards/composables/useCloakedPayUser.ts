import store from "@/store";
import { computed } from "vue";

export default function useCloakedPayUser() {
  const user = computed(() => {
    return store.state.authentication?.user;
  });

  const isEnabled = computed(() => {
    return (
      user.value?.cloaked_card_enabled ||
      user.value?.cloaked_card_enabled_status === "enabled"
    );
  });

  const isKycValidated = computed(() => {
    return user.value?.cloaked_card_kyc_configured;
  });

  const isOnboardingCompleted = computed(() => {
    return user.value?.cloaked_card_post_kyc_onboarding_completed;
  });

  const collection = computed(() => {
    return user.value?.card_collections;
  });

  const collectionsActive = computed(() => {
    return (
      collection.value?.status === "active" ||
      collection.value?.status === "pending"
    );
  });

  return {
    user,
    isEnabled,
    isKycValidated,
    isOnboardingCompleted,
    collection,
    collectionsActive,
  };
}
