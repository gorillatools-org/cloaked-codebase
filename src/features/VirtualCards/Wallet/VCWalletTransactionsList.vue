<script setup lang="ts">
import {
  onBeforeMount,
  watch,
  computed,
  type MaybeRefOrGetter,
  ref,
  useTemplateRef,
  nextTick,
} from "vue";
import { toValue } from "@vueuse/core";
import { debounce } from "lodash-es";
import BaseText from "@/library/BaseText.vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import useWalletTransactions from "@/features/VirtualCards/composables/useWalletTransactions";
import VCWalletTransactionItem from "@/features/VirtualCards/Wallet/VCWalletTransactionItem.vue";
import VCWalletTransactionItemSkeleton from "@/features/VirtualCards/Wallet/VCWalletTransactionItemSkeleton.vue";
import VCWalletTransactionsEmptyCarousel from "@/features/VirtualCards/Wallet/VCWalletTransactionsEmptyCarousel.vue";
import type { Transaction } from "@/types/Wallet/transaction";
import { useInfiniteScroll } from "@vueuse/core";
import { useVCTransactionDetailsStore } from "@/features/VirtualCards/store/useVCTransactionDetailsStore";
import moment from "moment";
import VCBaseDropdownSelect from "@/features/VirtualCards/base/VCBaseDropdownSelect.vue";
import type { DropdownSelectOption } from "@/features/VirtualCards/base/VCBaseDropdownSelect.vue";
import type { GetTransactionsSortOption } from "@/features/VirtualCards/composables/useWalletTransactions";
import store from "@/store";
import { useWalletPageContext } from "@/features/VirtualCards/composables/pages-context/useWalletPageContext";
import { posthogCapture } from "@/scripts/posthog.js";

type GroupedTransactions = {
  label: string;
  transactions: Transaction[];
};

type Props = {
  cardId?: string;
  scrollContainer: MaybeRefOrGetter<HTMLDivElement>;
  showEmptyCarousel?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  cardId: undefined,
  showEmptyCarousel: true,
});

const DEFAULT_SORT_OPTION: GetTransactionsSortOption = "-created_at";

const sortOptions: DropdownSelectOption<GetTransactionsSortOption>[] = [
  {
    label: "Newest",
    value: "-created_at",
  },
  {
    label: "Oldest",
    value: "created_at",
  },
  {
    label: "Highest Amount",
    value: "-transaction_amount",
  },
  {
    label: "Lowest Amount",
    value: "transaction_amount",
  },
];

const pagination = {
  page: 1,
  pageSize: 50,
};

const { showAdvancedCardGenerationModal } = useWalletPageContext();

const { transactions, getTransactions, isEmpty, canLoadMore } =
  useWalletTransactions(() => props.cardId || "");

const transactionDetailsStore = useVCTransactionDetailsStore();
const selectedTransactionSort =
  ref<GetTransactionsSortOption>(DEFAULT_SORT_OPTION);
const searchInputRef =
  useTemplateRef<InstanceType<typeof BaseInput>>("searchInputRef");

const searchQuery = ref("");
const isSearchVisible = ref(false);
const hasInitiallyLoaded = ref(false);
const isLoading = ref(false);
const isLoadingMore = ref(false);
let currentRequestId = 0;

useInfiniteScroll(() => toValue(props.scrollContainer), loadMore, {
  distance: 500,
  interval: 3000,
  canLoadMore: () =>
    canLoadMore.value && !isLoading.value && !isLoadingMore.value,
});

onBeforeMount(() => {
  fetchTransactions();
});

const shouldShowSkeleton = computed(() => {
  if (!hasInitiallyLoaded.value) {
    return true;
  }

  if (transactions.value === null) {
    return true;
  }

  if (isEmpty.value && isLoading.value) {
    return true;
  }

  return false;
});

const groupedTransactions = computed<GroupedTransactions[]>(() => {
  if (!transactions.value || transactions.value.length === 0) {
    return [];
  }

  // Don't group by month when sorting by amount
  const isSortingByAmount =
    selectedTransactionSort.value === "-transaction_amount" ||
    selectedTransactionSort.value === "transaction_amount";

  if (isSortingByAmount) {
    return [
      {
        label: "",
        transactions: transactions.value,
      },
    ];
  }

  const groups = new Map<string, Transaction[]>();

  transactions.value.forEach((transaction) => {
    const monthYear = moment(transaction.created_at).format("MMMM YYYY");

    if (!groups.has(monthYear)) {
      groups.set(monthYear, []);
    }

    groups.get(monthYear)?.push(transaction);
  });

  return Array.from(groups.entries())
    .map(([label, transactions]) => ({
      label,
      transactions,
    }))
    .sort((a, b) => {
      const dateA = moment(a.label, "MMMM YYYY");
      const dateB = moment(b.label, "MMMM YYYY");

      // When sorting by oldest
      if (selectedTransactionSort.value === "created_at") {
        return dateA.valueOf() - dateB.valueOf();
      }

      // When sorting by newest
      return dateB.valueOf() - dateA.valueOf();
    });
});

const fetchTransactions = (options: { page?: number } = {}) => {
  const { page = 1 } = options;
  pagination.page = page;

  const isPagination = page > 1;

  const requestId = ++currentRequestId;
  isLoading.value = true;

  return getTransactions({
    ...pagination,
    sort: selectedTransactionSort.value,
    search: searchQuery.value,
    shouldStore: !isPagination,
    shouldClear: !hasInitiallyLoaded.value,
  })
    .then((response) => {
      if (isPagination) {
        store.dispatch("addMoreTransactions", response.data);
      }
    })
    .finally(() => {
      // Only update loading state if this is still the current request
      if (requestId === currentRequestId) {
        isLoading.value = false;
        hasInitiallyLoaded.value = true;
      }
    });
};

const focusSearchInput = () => {
  nextTick(() => {
    searchInputRef.value?.$el?.querySelector?.("input")?.focus();
  });
};

const debouncedSearchTransactions = debounce(() => {
  fetchTransactions({ page: 1 });
}, 700);

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;

  if (isSearchVisible.value) {
    focusSearchInput();
  } else {
    debouncedSearchTransactions.cancel();

    if (searchQuery.value) {
      searchQuery.value = "";
    }
  }
};

const clearSearch = () => {
  debouncedSearchTransactions.cancel();
  searchQuery.value = "";
};

function handleTransactionClick(transaction: Transaction): void {
  posthogCapture("pay_wallet_transaction_details_viewed", {
    transaction_id: transaction.id,
    merchant_category: transaction.merchant_category ?? "unknown",
    status: transaction.status ?? "unknown",
    rejection_reason: transaction.rejection_reason ?? "unknown",
  });
  transactionDetailsStore.openRightPanel(transaction.id);
}

function loadMore() {
  pagination.page++;
  isLoadingMore.value = true;

  return fetchTransactions({ page: pagination.page })
    .catch(() => {
      pagination.page--;
    })
    .finally(() => {
      isLoadingMore.value = false;
    });
}

watch(selectedTransactionSort, () => {
  debouncedSearchTransactions.cancel();
  isLoading.value = true;
  fetchTransactions();
});

watch(searchQuery, () => {
  isLoading.value = true;
  debouncedSearchTransactions();
});

watch(
  () => props.cardId,
  () => {
    debouncedSearchTransactions.cancel();
    selectedTransactionSort.value = DEFAULT_SORT_OPTION;
    searchQuery.value = "";
    isSearchVisible.value = false;
    hasInitiallyLoaded.value = false;
    fetchTransactions();
  }
);
</script>

<template>
  <section
    class="vc-wallet-transactions-list"
    :class="{
      'vc-wallet-transactions-list--loading': isLoading,
      'vc-wallet-transactions-list--subtle-loading':
        !shouldShowSkeleton && !isLoadingMore && isLoading,
    }"
  >
    <header class="vc-wallet-transactions-list__header">
      <div
        :key="props.cardId ? 'card' : 'all'"
        class="vc-wallet-transactions-list__header-title-container"
      >
        <BaseText
          variant="headline-5-bold"
          class="vc-wallet-transactions-list__header-title-text"
        >
          {{ props.cardId ? "Card Activity" : "All Card Activity" }}
        </BaseText>

        <div
          class="vc-wallet-transactions-list__header-sort-container"
          :class="{
            'vc-wallet-transactions-list__header-sort-container--disabled':
              !hasInitiallyLoaded,
          }"
        >
          <VCBaseDropdownSelect
            v-model="selectedTransactionSort"
            class="vc-wallet-transactions-list__header-sort-select"
            open-width="180px"
            :options="sortOptions"
          />
          <span
            role="button"
            tabindex="0"
            class="vc-wallet-transactions-list__header-search-btn"
            :class="{
              'vc-wallet-transactions-list__header-search-btn--active':
                isSearchVisible,
            }"
            @click="toggleSearch"
          >
            <BaseIcon
              name="search"
              class="vc-wallet-transactions-list__header-search-btn-icon"
            />
          </span>
        </div>
      </div>
      <Transition
        name="search-input"
        @after-enter="focusSearchInput"
      >
        <div
          v-if="isSearchVisible"
          class="vc-wallet-transactions-list__header-search-container"
        >
          <div class="vc-wallet-transactions-list__header-search-input-wrapper">
            <BaseInput
              ref="searchInputRef"
              v-model="searchQuery"
              placeholder="Search transactions"
              class="vc-wallet-transactions-list__header-search-input"
            />
            <Transition
              name="icon-switch"
              mode="out-in"
            >
              <button
                v-if="searchQuery && !isLoading"
                type="button"
                class="vc-wallet-transactions-list__header-search-clear-btn"
                aria-label="Clear search"
                @mousedown.prevent
                @click="clearSearch"
              >
                <BaseIcon
                  name="close"
                  class="vc-wallet-transactions-list__header-search-clear-btn-icon"
                />
              </button>
              <span
                v-else-if="searchQuery && isLoading"
                class="vc-wallet-transactions-list__header-search-loader"
              >
                <span
                  class="vc-wallet-transactions-list__header-search-loader-icon"
                />
              </span>
            </Transition>
          </div>
        </div>
      </Transition>
    </header>
    <Transition
      name="skeleton-fade"
      mode="out-in"
    >
      <div
        v-if="shouldShowSkeleton"
        key="skeletons"
        class="vc-wallet-transactions-list__list"
      >
        <span
          class="vc-wallet-transactions-list__group-label-skeleton skeleton-shimmer"
        ></span>
        <VCWalletTransactionItemSkeleton
          v-for="i in 10"
          :key="i"
        />
      </div>
      <div
        v-else-if="isEmpty && !shouldShowSkeleton && !isLoading"
        key="empty"
        class="vc-wallet-transactions-list__empty-container"
      >
        <VCWalletTransactionsEmptyCarousel
          v-if="showEmptyCarousel && !searchQuery && !isLoading"
          @get-started="showAdvancedCardGenerationModal"
        />
        <BaseText
          v-else
          variant="headline-4-bold"
          class="vc-wallet-transactions-list__empty-text"
        >
          No activity found
        </BaseText>
      </div>
      <div
        v-else
        key="transactions"
        class="vc-wallet-transactions-list__list"
      >
        <div
          v-for="(group, index) in groupedTransactions"
          :key="group.label || `unlabeled-${index}`"
          class="vc-wallet-transactions-list__group"
        >
          <BaseText
            v-if="group.label"
            variant="headline-5-bold"
            class="vc-wallet-transactions-list__group-label"
          >
            {{ group.label }}
          </BaseText>

          <div
            v-for="transaction in group.transactions"
            :key="transaction.id"
            class="vc-wallet-transactions-list__list-item"
          >
            <VCWalletTransactionItem
              :focused="
                transactionDetailsStore.isRightPanelOpen &&
                transactionDetailsStore.transactionId === transaction.id
              "
              :transaction-id="transaction.id"
              @click="handleTransactionClick(transaction)"
            />
          </div>
        </div>
        <template v-if="isLoadingMore">
          <div
            v-for="i in 3"
            :key="`skeleton-${i}`"
            class="vc-wallet-transactions-list__list-item"
          >
            <VCWalletTransactionItemSkeleton />
          </div>
        </template>
      </div>
    </Transition>
  </section>
</template>

<style lang="scss" scoped>
@import "@/features/VirtualCards/assets/skeleton";

.vc-wallet-transactions-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;

  &__header {
    min-height: 35px;

    &-title-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    &-title-text {
      display: inline-block;
      min-height: 35px;
      transform: translateY(7px);
    }

    &-sort-container {
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 1;
      transition: opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);

      &--disabled {
        opacity: 0.7;
        pointer-events: none;
      }
    }

    &-sort-select {
      z-index: 2;
    }

    &-search {
      &-container {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        overflow: hidden;
      }

      &-input-wrapper {
        position: relative;
        width: 100%;
      }

      &-input {
        width: 100%;

        :deep(.base-input__title) {
          display: none;
        }

        :deep(.base-input__input) {
          border-radius: 24px;
          border-color: $color-base-black-15;
          padding-right: 44px !important;
          height: 48px;

          &:focus {
            box-shadow: none;
            border-color: $color-primary-100;
            background-color: $color-primary-100-dark;

            @at-root .theme-dark & {
              background-color: $color-primary-100-light;
            }
          }

          &:hover:not(:focus) {
            border-color: $color-base-black-20;
          }
        }
      }

      &-clear-btn {
        position: absolute;
        right: 16px;
        top: 4px;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin: auto 0;
        padding: 0;
        border: none;
        background: $color-primary-30;
        cursor: pointer;
        border-radius: 50%;
        transition: background-color 0.12s cubic-bezier(0.25, 0.1, 0.25, 1);
        z-index: 2;

        &:hover {
          background-color: $color-primary-50;
        }

        &:focus {
          outline: none;
        }

        &:focus-visible {
          outline: 2px solid $color-primary-100;
          outline-offset: 2px;
        }

        &-icon {
          width: 13px;
          height: 13px;
          font-size: 13px;
          flex-shrink: 0;
          color: $color-white;
        }
      }

      &-loader {
        position: absolute;
        right: 16px;
        top: 20px;
        bottom: 0;
        width: 1em;
        height: 1em;
        border-radius: 50%;
        background: linear-gradient(currentcolor 40%, transparent 70%);
        mask: radial-gradient(closest-side, transparent 70%, black 70%);
        animation: rotate 0.4s linear infinite;
      }

      &-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        padding: 4px 5px;
        border-radius: 999px;
        border: 1px solid $color-base-black-15;
        background-color: $color-base-white-100;
        cursor: pointer;
        transition:
          background-color 0.12s cubic-bezier(0.25, 0.1, 0.25, 1),
          border-color 0.12s cubic-bezier(0.25, 0.1, 0.25, 1);

        &:hover {
          background-color: $color-primary-10;
          border-color: $color-base-black-20;
        }

        &:focus {
          outline: none;
        }

        &:focus-visible {
          outline: 2px solid $color-primary-100;
          outline-offset: 2px;
        }

        &--active {
          background-color: $color-primary-10;
          border-color: transparent;

          &:hover {
            background-color: $color-primary-10;
            border-color: transparent;
            opacity: 0.9;
          }
        }

        &-icon {
          width: 16px;
          height: 16px;
          font-size: 16px;
        }
      }
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    padding-bottom: 24px;
    opacity: 1;
    transition:
      opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
      filter 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);

    .vc-wallet-transactions-list--subtle-loading & {
      opacity: 0.6;
      pointer-events: none;
      filter: blur(1px);
    }
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &-label {
      padding: 12px 0 9px;
      position: sticky;
      top: -25px;
      background-color: $color-primary-5;
      z-index: 1;

      &-skeleton {
        width: 120px;
        height: 20px;
        border-radius: 4px;
        display: block;
        margin-top: 14px;
        margin-bottom: 10px;
      }
    }

    &-transactions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
    }
  }

  &__empty {
    &-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      min-height: calc(100vh - 530px);
    }

    &-text {
      color: $color-primary-50;
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.skeleton-fade-enter-active,
.skeleton-fade-leave-active {
  transition:
    opacity 0.1s cubic-bezier(0.45, 0.05, 0.55, 0.95),
    filter 0.1s cubic-bezier(0.45, 0.05, 0.55, 0.95);
}

.skeleton-fade-enter-from {
  opacity: 0.9;
  filter: blur(0.8px);
}

.skeleton-fade-leave-to {
  opacity: 0.9;
  filter: blur(0.8px);
}

.search-input-enter-active,
.search-input-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
    max-height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
    margin-top 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  overflow: hidden;
}

.icon-switch-enter-active,
.icon-switch-leave-active {
  transition:
    opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.1s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-switch-enter-from,
.icon-switch-leave-to {
  opacity: 1;
  filter: blur(1.2px);
  transform: translateY(1px) scale(0.7);
  transform-origin: center;
}

.icon-switch-enter-to,
.icon-switch-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
  transform-origin: center;
}

.search-input-enter-from {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}

.search-input-enter-to {
  opacity: 1;
  max-height: 100px;
  margin-top: 16px;
}

.search-input-leave-from {
  opacity: 1;
  max-height: 100px;
  margin-top: 16px;
}

.search-input-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}
</style>
