import { defineStore } from "pinia";
import { computed, ref } from "vue";
import useOutstandingBalance from "../composables/useOutstandingBalance";

export const useVirtualCardsWalletPageStore = defineStore(
  "virtual-cards-wallet-page-store",
  () => {
    const { hasCollectionStatus } = useOutstandingBalance();

    // Used to animate components on mount, to prevent animation on component remount
    const shouldAnimateOnMount = ref(true);

    const allowCardCreation = computed(() => {
      return !hasCollectionStatus.value;
    });

    const setShouldAnimateOnMount = (value: boolean) => {
      shouldAnimateOnMount.value = value;
    };

    return {
      shouldAnimateOnMount,
      allowCardCreation,
      setShouldAnimateOnMount,
    };
  }
);
