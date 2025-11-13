import CardsServices from "@/api/actions/cards-services";
import store from "@/store";
import type { Transaction } from "@/types/Wallet/transaction";
import {
  computed,
  onUnmounted,
  ref,
  type MaybeRefOrGetter,
  toValue,
} from "vue";
import { useToast } from "@/composables/useToast.js";

export type GetTransactionsSortOption =
  | "created_at"
  | "-created_at"
  | "transaction_amount"
  | "-transaction_amount";

export type GetTransactionsParams = {
  pageSize?: number;
  page?: number;
  sort?: GetTransactionsSortOption;
  search?: string;
  shouldClear?: boolean;
  shouldStore?: boolean;
};

export default function useWalletTransactions(
  cardId?: MaybeRefOrGetter<string | undefined | null>
) {
  const toast = useToast();
  const isExporting = ref(false);

  let abortController: AbortController | null = null;
  let exportAbortController: AbortController | null = null;

  onUnmounted(() => {
    if (abortController) {
      abortController.abort();
    }

    if (exportAbortController) {
      exportAbortController.abort();
    }
  });

  const cardIdValue = computed(() => {
    return toValue(cardId);
  });

  const transactions = computed<Transaction[]>(() => {
    return store.state.cards.transactions.results || null;
  });

  const isEmpty = computed(() => {
    return transactions.value?.length === 0;
  });

  const transactionsCount = computed(() => {
    return store.state.cards.transactions.count || 0;
  });

  const canLoadMore = computed(() => {
    return (
      !isEmpty.value && transactions.value?.length < transactionsCount.value
    );
  });

  const rightPanelSelectedTransaction = computed<Transaction | null>(() => {
    return store.state.cards.rightPanel.transaction;
  });

  const _createAbortableRequest = <T>(
    controller: AbortController,
    request: Promise<T>,
    cleanup: () => void,
    onSuccess?: (response: T) => void,
    onError?: (error: any) => void,
    onFinally?: () => void
  ) => {
    const signal = controller.signal;

    return request
      .then((response) => {
        if (!signal.aborted) {
          onSuccess?.(response);
        }
        return response;
      })
      .catch((error) => {
        if (error.name !== "AbortError" && error.name !== "CanceledError") {
          if (!signal.aborted) {
            onError?.(error);
            throw error;
          }
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          onFinally?.();
          cleanup();
        }
      });
  };

  function getTransactions(params: GetTransactionsParams = {}) {
    const {
      pageSize = 50,
      page = 1,
      sort = "created_at",
      search = "",
      shouldClear = true,
      shouldStore = true,
    } = params;

    if (shouldClear) {
      store.dispatch("setTransactions", { count: 0, results: null });
    }

    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();

    const request = cardIdValue.value
      ? CardsServices.getTransactionsByCardId(
          cardIdValue.value,
          pageSize,
          page,
          shouldStore,
          sort,
          search,
          abortController.signal
        )
      : CardsServices.getTransactions(
          pageSize,
          page,
          shouldStore,
          sort,
          search,
          abortController.signal
        );

    return _createAbortableRequest(
      abortController,
      request,
      () => {
        abortController = null;
      },
      undefined,
      (error) => {
        toast.error(error?.message || error || "Error fetching transactions");
      }
    );
  }

  function exportTransactions() {
    if (exportAbortController) {
      exportAbortController.abort();
    }

    exportAbortController = new AbortController();

    const request = cardIdValue.value
      ? CardsServices.exportTransactionsForCard(
          cardIdValue.value,
          exportAbortController.signal
        )
      : CardsServices.exportTransactions(exportAbortController.signal);

    isExporting.value = true;

    return _createAbortableRequest(
      exportAbortController,
      request,
      () => {
        exportAbortController = null;
      },
      (response) => {
        const csvData = response.data;
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.setAttribute("download", "cloaked-pay-transactions.csv");

        document.body.appendChild(link);
        link.click();

        URL.revokeObjectURL(url);
        toast.success("Transactions exported successfully");
      },
      (error) => {
        toast.error(error?.message || error || "Error exporting transactions");
      },
      () => {
        isExporting.value = false;
      }
    );
  }

  return {
    transactions,
    isEmpty,
    transactionsCount,
    canLoadMore,
    isExporting,
    rightPanelSelectedTransaction,
    getTransactions,
    exportTransactions,
  };
}
