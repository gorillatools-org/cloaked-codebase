import { defineStore } from "pinia";
import { computed, ref } from "vue";
import useCloakedPayUser from "../composables/useCloakedPayUser";

export const useVirtualCardsWalletPageStore = defineStore(
  "virtual-cards-wallet-page-store",
  () => {
    const { collectionsActive } = useCloakedPayUser();

    // Used to animate components on mount, to prevent animation on component remount
    const shouldAnimateOnMount = ref(true);

    const allowCardCreation = computed(() => {
      return !collectionsActive.value;
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
