import { defineStore } from "pinia";
import { ref } from "vue";

export const useVCTransactionDetailsStore = defineStore(
  "virtual-cards-transaction-details-store",
  () => {
    const isRightPanelOpen = ref(false);
    const transactionId = ref<string | null>(null);

    const openRightPanel = (id: string) => {
      isRightPanelOpen.value = true;
      transactionId.value = id;
    };

    const closeRightPanel = () => {
      isRightPanelOpen.value = false;
      transactionId.value = null;
    };

    return {
      isRightPanelOpen,
      transactionId,
      openRightPanel,
      closeRightPanel,
    };
  }
);
