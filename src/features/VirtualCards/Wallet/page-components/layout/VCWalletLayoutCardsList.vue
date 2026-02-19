<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import useVirtualCards from "@/features/VirtualCards/composables/useVirtualCards";
import VCCardListItem from "@/features/VirtualCards/Wallet/VCCardListItem.vue";
import VCCardListItemSkeleton from "@/features/VirtualCards/Wallet/VCCardListItemSkeleton.vue";
import { computed, nextTick, ref, watch } from "vue";
import { useRoute } from "vue-router";
import moment from "moment";
import type {
  CardsListSortOption,
  CardsListFilterOption,
} from "./VCWalletLayoutAside.vue";

const props = defineProps<{
  sortOption: CardsListSortOption;
  filterOption: CardsListFilterOption;
  searchQuery?: string;
}>();

const { cardsList } = useVirtualCards();
const route = useRoute();
const isTransitionEnabled = ref(true);

const isLoading = computed(() => {
  return !cardsList.value;
});

const isEmpty = computed(() => {
  return !isLoading.value && !sortedCardsList.value.length;
});

const filteredCardsList = computed(() => {
  if (!cardsList.value) {
    return [];
  }

  let filtered = [...(cardsList.value || [])];

  if (props.searchQuery?.trim()) {
    const query = props.searchQuery.trim().toLowerCase();
    filtered = filtered.filter((card) => {
      const identityNameMatch = card.identity_name
        ?.toLowerCase()
        .includes(query);

      const panMatch = card.pan
        ?.toLowerCase()
        .replace(/\*/g, "")
        .includes(query);

      return identityNameMatch || panMatch;
    });
  }

  return filtered;
});

const sortedCardsList = computed(() => {
  if (!filteredCardsList.value.length) {
    return [];
  }

  return [...filteredCardsList.value].sort((a, b) => {
    if (props.sortOption === "newest") {
      const dateField =
        props.filterOption === "active" ? "created_at" : "updated_at";
      return (
        moment.utc(b[dateField]).valueOf() - moment.utc(a[dateField]).valueOf()
      );
    }

    if (props.sortOption === "oldest") {
      const dateField =
        props.filterOption === "active" ? "created_at" : "updated_at";
      return (
        moment.utc(a[dateField]).valueOf() - moment.utc(b[dateField]).valueOf()
      );
    }

    if (props.sortOption === "amount-available") {
      const isLockedA =
        a.state === "locked_by_user" || a.state === "locked_by_system";
      const isLockedB =
        b.state === "locked_by_user" || b.state === "locked_by_system";

      // Locked cards should always be last when sorting by amount-available
      if (isLockedA && !isLockedB) {
        return 1;
      }

      if (!isLockedA && isLockedB) {
        return -1;
      }

      const availableLimitA =
        (a.transaction_period_limit || 0) - (a.spent_period || 0);

      const availableLimitB =
        (b.transaction_period_limit || 0) - (b.spent_period || 0);

      return availableLimitB - availableLimitA;
    }

    return 0;
  });
});

// Scroll to the card when the route is changed to the card page
watch(
  () => [route.name, route.params.id, cardsList.value],
  ([routeName, cardId, _cardsList]) => {
    if (routeName !== "VirtualCardsWalletCard") {
      return;
    }

    if (cardId && _cardsList) {
      nextTick(() => {
        const cardElement = document.querySelector(`#card-${String(cardId)}`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }
  }
);

watch(
  () => props.searchQuery,
  () => {
    isTransitionEnabled.value = false;
    setTimeout(() => {
      isTransitionEnabled.value = true;
    }, 10);
  },
  { flush: "pre" }
);
</script>
<template>
  <div
    class="vc-wallet-layout-cards-list"
    :class="{
      'vc-wallet-layout-cards-list--full-height': isEmpty || isLoading,
    }"
  >
    <Transition
      name="skeleton-fade"
      mode="out-in"
    >
      <div
        v-if="isLoading"
        key="skeletons"
        class="vc-wallet-layout-cards-list__cards-list"
      >
        <VCCardListItemSkeleton
          v-for="i in 7"
          :key="i"
          :type="filterOption"
        />
      </div>
      <div v-else-if="isEmpty">
        <div class="vc-wallet-layout-cards-list__empty-container">
          <BaseText
            v-if="searchQuery"
            variant="headline-4-bold"
            class="vc-wallet-layout-cards-list__empty-text"
          >
            No cards found
          </BaseText>
          <BaseText
            v-else
            variant="headline-4-bold"
            class="vc-wallet-layout-cards-list__empty-text"
          >
            You have no
            {{ filterOption === "active" ? "active" : "canceled" }} cards
          </BaseText>
        </div>
      </div>
      <TransitionGroup
        v-else
        key="cards"
        :name="isTransitionEnabled ? 'card' : ''"
        :css="isTransitionEnabled"
        tag="div"
        class="vc-wallet-layout-cards-list__cards-list"
        :class="{
          'vc-wallet-layout-cards-list__cards-list--canceled':
            filterOption === 'canceled',
        }"
      >
        <VCCardListItem
          v-for="card in sortedCardsList"
          :id="`card-${card.id}`"
          :key="card.id"
          :card="card"
          :animate-on-mount="isTransitionEnabled"
        />
      </TransitionGroup>
    </Transition>
  </div>
</template>
<style scoped lang="scss">
.vc-wallet-layout-cards-list {
  &--full-height {
    height: 100%;
  }

  &__cards-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
  }

  &__empty {
    &-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
    }

    &-text {
      color: $color-primary-50;
    }
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
    top: 80px;
  }

  100% {
    opacity: 1;
    top: 0;
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
    opacity 0.07s cubic-bezier(0.45, 0.05, 0.55, 0.95),
    filter 0.05s cubic-bezier(0.45, 0.05, 0.55, 0.95);
}

.skeleton-fade-enter-from {
  opacity: 0.8;
  filter: blur(0.8px);
}

.skeleton-fade-leave-to {
  opacity: 0.8;
  filter: blur(0.8px);
}

.card-enter-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.card-leave-active {
  position: absolute;
  width: 100%;
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.card-enter-from {
  opacity: 0.5;
  filter: blur(0.6px);
  transform-origin: center;
  transform: translateY(-10px) scale(0.97);
}

.card-leave-to {
  opacity: 0.6;
  filter: blur(0.6px);
  transform: translateY(10px);
}

.card-move {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
