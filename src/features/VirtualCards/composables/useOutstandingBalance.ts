import store from "@/store";
import { computed } from "vue";
import { formatCurrency } from "@/features/VirtualCards/utils/currency-utils";

export default function useOutstandingBalance() {
  const _user = computed(() => {
    return store.getters["authentication/user"];
  });

  const outstandingBalance = computed(() => {
    return _user.value?.outstanding_balance ?? 0;
  });

  const formattedOutstandingBalance = computed(() => {
    return formatCurrency(outstandingBalance.value);
  });

  const isCollectionActive = computed(() => {
    return _user.value?.card_collections?.status === "active";
  });

  const isCollectionPending = computed(() => {
    return _user.value?.card_collections?.status === "pending";
  });

  const hasCollectionStatus = computed(() => {
    return isCollectionActive.value || isCollectionPending.value;
  });

  const refresh = () => {
    return store.dispatch("authentication/getUser");
  };

  return {
    outstandingBalance,
    formattedOutstandingBalance,
    hasCollectionStatus,
    isCollectionActive,
    isCollectionPending,
    refresh,
  };
}
