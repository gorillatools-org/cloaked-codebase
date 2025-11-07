import { type MaybeRefOrGetter } from "vue";
import { useToast } from "@/composables/useToast";
import store from "@/store";
import type { VirtualCard } from "@/types/Wallet/virtual-card";
import useVirtualCard from "./useVirtualCard";

export default function useVirtualCardActionsHandler(
  card: MaybeRefOrGetter<VirtualCard | string>
) {
  const toast = useToast();
  const { card: _card } = useVirtualCard(card);

  const showErrorMessage = (
    error: any,
    fallbackMsg = "Oops! Something went wrong. Please try again."
  ) => {
    toast.error(
      error?.response?.data?.errors ||
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        fallbackMsg
    );
  };

  const optimisticUpdate = (updatedCard: VirtualCard) => {
    if (!_card.value) {
      throw new Error(`Virtual Card not found`);
    }

    const tempCard = { ..._card.value };
    store.dispatch("updateCard", updatedCard);

    return {
      rollback: () => {
        store.dispatch("updateCard", tempCard);
      },
    };
  };

  return {
    showErrorMessage,
    optimisticUpdate,
  };
}
