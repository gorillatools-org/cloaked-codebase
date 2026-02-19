<script setup lang="ts">
import { ref, onMounted, computed, watch, useTemplateRef, nextTick } from "vue";
import { useRouter } from "vue-router";
import VCExpressGeneration from "@/features/VirtualCards/VCExpressGeneration.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { DropdownMenuItem } from "@/features/VirtualCards/base/VCBaseDropdownMenu.vue";
import VCBaseDropdownMenu from "@/features/VirtualCards/base/VCBaseDropdownMenu.vue";
import VCWalletLayoutCardsList from "@/features/VirtualCards/Wallet/page-components/layout/VCWalletLayoutCardsList.vue";
import useVirtualCards from "@/features/VirtualCards/composables/useVirtualCards";
import type { DropdownSelectOption } from "@/features/VirtualCards/base/VCBaseDropdownSelect.vue";
import VCBaseDropdownSelect from "@/features/VirtualCards/base/VCBaseDropdownSelect.vue";
import BaseInput from "@/library/BaseInput.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { useWalletPageContext } from "@/features/VirtualCards/composables/pages-context/useWalletPageContext";
import type { VirtualCardPeriod } from "@/types/Wallet/virtual-card";

export type CardsListSortOption = "newest" | "oldest" | "amount-available";
export type CardsListFilterOption = "active" | "canceled";

const emit = defineEmits(["addCard", "newCardIssued"]);

const { showAdvancedCardGenerationModal } = useWalletPageContext();

const router = useRouter();
const { refetchCards } = useVirtualCards();

const asideRef = useTemplateRef<HTMLElement>("asideRef");
const cardsListContentRef = useTemplateRef<HTMLElement>("cardsListContentRef");
const expressGenerationRef = useTemplateRef<
  InstanceType<typeof VCExpressGeneration>
>("expressGenerationRef");
const searchInputRef =
  useTemplateRef<InstanceType<typeof BaseInput>>("searchInputRef");

const selectedFilter = ref<CardsListFilterOption>("active");
const selectedSort = ref<CardsListSortOption>("newest");
const searchQuery = ref("");
const isSearchVisible = ref(false);

onMounted(() => {
  getCards();
});

const sortOptions = computed<DropdownSelectOption<CardsListSortOption>[]>(
  () => {
    const baseOptions: DropdownSelectOption<CardsListSortOption>[] = [
      {
        label: "Newest",
        value: "newest",
      },
      {
        label: "Oldest",
        value: "oldest",
      },
    ];

    const activeCardsOptions: DropdownSelectOption<CardsListSortOption>[] = [
      {
        label: "Amount available",
        value: "amount-available",
      },
    ];

    return [
      ...baseOptions,
      ...(selectedFilter.value === "active" ? activeCardsOptions : []),
    ];
  }
);

const filterOptionsList = computed<DropdownMenuItem[][]>(() => {
  return [
    [
      {
        id: "active",
        label: "Active",
        icon: selectedFilter.value === "active" ? "check" : undefined,
        iconPosition: "right",
        onClick: () => (selectedFilter.value = "active"),
      },
      {
        id: "canceled",
        label: "Canceled",
        icon: selectedFilter.value === "canceled" ? "check" : undefined,
        iconPosition: "right",
        onClick: () => (selectedFilter.value = "canceled"),
      },
    ],
  ];
});

const switchToActiveAndFetchCards = (silent = false) => {
  selectedFilter.value = "active";
  return getCards(silent);
};

const getCards = (silent = false) => {
  expressGenerationRef.value?.clearErrors();
  return refetchCards(silent, selectedFilter.value);
};

const onNewCardIssued = (cardId: string) => {
  scrollCardsListToTop();
  selectedSort.value = "newest";
  emit("newCardIssued", cardId);
};

const scrollCardsListToTop = () => {
  nextTick(() => {
    // On larger screens, the cards-list-content is scrollable
    if (cardsListContentRef.value) {
      cardsListContentRef.value.scrollTop = 0;
    }

    // On smaller screens, the aside container itself is scrollable
    if (asideRef.value) {
      asideRef.value.scrollTop = 0;
    }
  });
};

const focusSearchInput = () => {
  nextTick(() => {
    searchInputRef.value?.$el?.querySelector?.("input")?.focus();
  });
};

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
  if (isSearchVisible.value) {
    posthogCapture("pay_wallet_search_input_visible");
    focusSearchInput();
  } else {
    searchQuery.value = "";
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  focusSearchInput();
};

const handleShowAdvancedModal = (payload?: {
  period?: VirtualCardPeriod;
  amount?: number;
}) => {
  showAdvancedCardGenerationModal({
    period: payload?.period,
    amount: payload?.amount,
  });
};

watch(selectedSort, () => {
  scrollCardsListToTop();
});

watch(selectedFilter, (newFilter, oldFilter) => {
  if (newFilter !== oldFilter) {
    // Canceled cards don't have amount available, so we need to reset the sort option
    if (
      selectedFilter.value === "canceled" &&
      selectedSort.value === "amount-available"
    ) {
      selectedSort.value = "newest";
    }

    void getCards();
    setTimeout(() => {
      scrollCardsListToTop();
    }, 110); // Wait for transition to complete
    router.push("/virtual-cards/wallet");
  }
});

defineExpose({
  switchToActiveAndFetchCards,
});
</script>

<template>
  <div
    ref="asideRef"
    class="vc-wallet-aside"
  >
    <div class="vc-wallet-aside__wrapper">
      <header class="vc-wallet-aside__header">
        <BaseIcon
          name="wallet"
          class="vc-wallet-aside__header-icon"
        />
        <BaseText
          variant="headline-3-medium"
          class="vc-wallet-aside__header-title"
        >
          Virtual Cards
        </BaseText>
        <div class="vc-wallet-aside__actions-container">
          <VCExpressGeneration
            ref="expressGenerationRef"
            @new-card-issued="onNewCardIssued"
            @show-advanced-modal="handleShowAdvancedModal"
          />
        </div>
      </header>

      <div class="vc-wallet-aside__cards-container">
        <div class="vc-wallet-aside__cards-header">
          <div class="vc-wallet-aside__cards-header-title-container">
            <VCBaseDropdownMenu
              :popper="{
                placement: 'bottom-start',
                offsetAway: 5,
                width: '150px',
              }"
              :items="filterOptionsList"
              @click.stop
            >
              <template #default="{ open }">
                <div class="vc-wallet-aside__cards-header-filter-container">
                  <BaseText
                    variant="headline-5-bold"
                    class="vc-wallet-aside__cards-header-filter-title"
                  >
                    {{
                      selectedFilter === "canceled"
                        ? "Canceled Cards"
                        : "Active Cards"
                    }}
                  </BaseText>
                  <BaseIcon
                    :style="{
                      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    }"
                    name="chevron-down"
                    class="vc-wallet-aside__cards-header-filter-icon"
                  />
                </div>
              </template>
            </VCBaseDropdownMenu>

            <div class="vc-wallet-aside__cards-header-sort-container">
              <VCBaseDropdownSelect
                v-model="selectedSort"
                class="vc-wallet-aside__cards-header-sort-select"
                open-width="180px"
                :options="sortOptions"
              />
              <span
                role="button"
                tabindex="0"
                class="vc-wallet-aside__cards-header-search-btn"
                :class="{
                  'vc-wallet-aside__cards-header-search-btn--active':
                    isSearchVisible,
                }"
                @click="toggleSearch"
              >
                <BaseIcon
                  name="search"
                  class="vc-wallet-aside__cards-header-search-btn-icon"
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
              class="vc-wallet-aside__cards-header-search-container"
            >
              <div class="vc-wallet-aside__cards-header-search-input-wrapper">
                <BaseInput
                  ref="searchInputRef"
                  v-model="searchQuery"
                  title=""
                  placeholder="Search cards"
                  class="vc-wallet-aside__cards-header-search-input"
                />
                <button
                  v-if="searchQuery"
                  type="button"
                  class="vc-wallet-aside__cards-header-search-clear-btn"
                  aria-label="Clear search"
                  @click="clearSearch"
                >
                  <BaseIcon
                    name="close"
                    class="vc-wallet-aside__cards-header-search-clear-btn-icon"
                  />
                </button>
              </div>
            </div>
          </Transition>
        </div>
        <div class="vc-wallet-aside__cards-list">
          <div
            ref="cardsListContentRef"
            class="vc-wallet-aside__cards-list-content"
          >
            <VCWalletLayoutCardsList
              :sort-option="selectedSort"
              :filter-option="selectedFilter"
              :search-query="searchQuery"
              @add-card="handleShowAdvancedModal"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin scroll-gradient($direction: bottom) {
  display: block;
  height: 30px;
  position: absolute;
  z-index: 1;
  width: 100%;
  background: linear-gradient(
    to $direction,
    rgba($color-primary-5-light, 0),
    rgba($color-primary-5-light, 1)
  );
  pointer-events: none;

  @at-root .theme-dark & {
    background: linear-gradient(
      to $direction,
      rgba($color-primary-5-dark, 0),
      rgba($color-primary-5-dark, 1),
      rgba($color-primary-5-dark, 1)
    );
  }
}

$only-cards-scroll-min-height: 650px;

.vc-wallet-aside {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;

  @include custom-scroll-bar;

  @container wallet-aside (min-height: #{$only-cards-scroll-min-height}) {
    overflow-y: hidden;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: 100%;
    padding-top: 24px;
    min-height: 0;
    flex: 1;

    @container wallet-page (min-width: 600px) {
      display: grid;
      grid-template-columns: 48% 49%;
      gap: 18px;
      padding-inline: 16px;
    }

    @container wallet-page (min-width: 730px) {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding-inline: 0;
    }
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 0 24px;

    @container wallet-page (min-width: 600px) {
      padding: 0;
    }

    @container wallet-page (min-width: 730px) {
      padding: 0 16px;
      gap: 18px;
    }

    @container wallet-page (min-width: 1200px) {
      padding: 0 24px;
    }

    &-icon {
      font-size: 25px;
      margin-left: 4px;
    }

    &-actions-container {
      position: relative;
    }
  }

  &__actions-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__cards {
    &-container {
      display: flex;
      flex-direction: column;
      flex-grow: 1;

      @container wallet-aside (min-height: #{$only-cards-scroll-min-height}) {
        overflow: hidden;
      }
    }

    &-header {
      display: flex;
      flex-direction: column;
      padding: 0 24px;

      @container wallet-page (min-width: 600px) {
        padding: 0;
      }

      @container wallet-page (min-width: 730px) {
        padding: 0 16px;
      }

      @container wallet-page (min-width: 1200px) {
        padding: 0 24px;
      }

      &-title-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
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
      }

      &-filter {
        &-container {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: opacity 0.12s ease-in-out;

          &:hover {
            color: $color-primary-90;
          }
        }

        &-icon {
          font-weight: 600;
          font-size: 18px;
          margin-top: -2px;
        }
      }

      &-sort-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      &-sort-select {
        z-index: 2;
      }

      &-search-btn {
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

    &-list {
      position: relative;
      max-height: 100%;
      padding-top: 2px;
      flex-grow: 1;
      min-height: 0;

      @container wallet-aside (min-height: #{$only-cards-scroll-min-height}) {
        &::after {
          content: "";
          bottom: 0;

          @include scroll-gradient;

          border-radius: 0;

          @media all and (min-width: $screen-xl) {
            border-radius: 0 20px 20px;
          }
        }

        &::before {
          content: "";
          top: 2px;

          @include scroll-gradient(top);
        }
      }

      &-content {
        padding-inline: 24px;
        padding-top: 26px;
        padding-bottom: 30px;
        max-height: 100%;
        flex-grow: 1;
        height: 100%;

        @container wallet-page (min-width: 600px) {
          padding-inline: 0;
        }

        @container wallet-page (min-width: 730px) {
          padding-inline: 16px;
          padding-top: 26px;
          padding-bottom: 30px;
        }

        @container wallet-page (min-width: 1200px) {
          padding-inline: 24px;
        }

        @container wallet-aside (min-height: #{$only-cards-scroll-min-height}) {
          @include custom-scroll-bar;

          overflow-y: auto;
        }
      }
    }
  }
}

.search-input-enter-active,
.search-input-leave-active {
  transition:
    opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
    max-height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
    margin-top 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  overflow: hidden;
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
