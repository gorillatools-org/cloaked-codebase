import CardsServices from "@/api/actions/cards-services";
import store from "@/store";
import type { VirtualCard } from "@/types/Wallet/virtual-card";
import { computed } from "vue";

export default function useVirtualCards() {
  const cardsList = computed<VirtualCard[] | undefined>(() => {
    return store.state.cards.cards.results;
  });

  const refetchCards = (
    silent = true,
    type: "active" | "canceled" = "active"
  ) => {
    if (!silent) {
      store.dispatch("addCardList", "");
    }
    return type === "active"
      ? CardsServices.getCardList()
      : CardsServices.getCancelCardList();
  };

  return {
    cardsList,
    refetchCards,
  };
}
