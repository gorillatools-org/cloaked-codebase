<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import CardSingle from "./CardsListing/CardSingle";
import CardsServices from "@/api/actions/cards-services";
import store from "@/store";
import inlineSvg from "@/features/InlineSvg.vue";
import ReceivePaymentsPanel from "./ReceivePaymentsPanel.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";
import { useRoute, useRouter } from "vue-router";
import VCExpressGeneration from "@/features/VirtualCards/VCExpressGeneration.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_VIRTUAL_CARDS_FEATURE_FLAG_EXPRESS_CARD_GENERATION } from "@/features/VirtualCards/constants/posthog-feature-flag";
import VCNewCardSkeleton from "@/features/VirtualCards/VCNewCardSkeleton.vue";

const emit = defineEmits(["type", "addCard", "newCardIssued"]);

const route = useRoute();
const router = useRouter();

const { featureFlag: isExpressCardGenerationEnabled } = usePostHogFeatureFlag(
  PH_VIRTUAL_CARDS_FEATURE_FLAG_EXPRESS_CARD_GENERATION
);

const loading = ref(true);
const receivePaymentsActive = ref(false);
const filterOption = ref("Active");
const expressGenerationRef = ref(null);

onMounted(() => {
  fetchCardsForCurrentFilter();
  receivePaymentsCheck();
});

const active = computed(() => {
  return store.state.cards.rightPanel.show;
});

const cards = computed(() => {
  return store.state.cards.cards;
});

const collection = computed(() => {
  return store.state.authentication?.user?.card_collections;
});

const isCanceledFilterActive = computed(() => {
  return filterOption.value === "Canceled";
});

const outstandingBalance = computed(() => {
  const balance = store.state.authentication?.user?.outstanding_balance;
  return balance >= 0 ? balance : 0;
});

const collectionsActive = computed(() => {
  return (
    collection.value?.status === "active" ||
    collection.value?.status === "pending"
  );
});

const fetchCardsForCurrentFilter = () => {
  if (filterOption.value === "Canceled") {
    cardsCanceled();
  } else if (filterOption.value === "Active") {
    cardsActive();
  }
};

const switchToActiveAndFetchCards = () => {
  filterOption.value = "Active";
  return cardsActive();
};

const changeFilter = (newFilter) => {
  filterOption.value = newFilter;
  emit("type", { type: newFilter });
};

const cardsActive = () => {
  loading.value = true;
  expressGenerationRef.value?.clearErrors();
  return CardsServices.getCardList().then(() => {
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  });
};

const cardsCanceled = () => {
  loading.value = true;
  CardsServices.getCancelCardList().then(() => {
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  });
};

function receivePaymentsCheck() {
  if (outstandingBalance.value > 0 || collectionsActive.value) {
    receivePaymentsActive.value = true;
    return;
  } else {
    receivePaymentsActive.value = false;
  }
}

watch(outstandingBalance, () => {
  receivePaymentsCheck();
});

watch(filterOption, (newFilter, oldFilter) => {
  if (newFilter !== oldFilter) {
    fetchCardsForCurrentFilter();
    router.push("/virtual-cards");
  }
});

watch(cards, () => {
  if (cards.value?.results?.length < 0) {
    loading.value = true;
    return;
  }

  // Determine mismatch based on filterOption and flags
  let isMismatch =
    cards.value?.results == null ||
    (filterOption.value === "Canceled" &&
      cards.value?.results?.some((card) => !card.canceled)) || // In "Canceled" view, all cards should have `canceled = true`
    (filterOption.value === "Active" &&
      cards.value?.results?.some((card) => card.canceled || card.gift)); // In "Active" view, no cards should have `canceled = true` or `gift = true`

  if (isMismatch) {
    fetchCardsForCurrentFilter();
  } else {
    loading.value = true;
    loading.value = false;
  }
});

watch(
  () => [route.params.id, cards.value?.results],
  ([cardId, cards]) => {
    if (cardId && cards) {
      nextTick(() => {
        const cardElement = document.querySelector(`#card-${cardId}`);
        if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }
  }
);

defineExpose({
  switchToActiveAndFetchCards,
});
</script>

<template>
  <div
    class="cards"
    :class="{ loaded: !loading, active: active }"
  >
    <ReceivePaymentsPanel
      v-if="receivePaymentsActive"
      :active="receivePaymentsActive"
      :outstanding-balance="outstandingBalance"
    />

    <div class="title">
      <h1>Wallet</h1>

      <div class="sort-item">
        <UiMenu placement="bottom-end">
          <div class="selected-sort-item">
            <span class="filter-label">Filter:</span>
            <p>{{ filterOption || "Active" }}</p>
            <inlineSvg
              name="chevron-down"
              width="13"
            />
          </div>
          <template #content>
            <UiMenuButton
              key="active"
              title="Active"
              :active="filterOption === 'Active'"
              @click="() => changeFilter('Active')"
            >
              <template #icon>
                <inlineSvg
                  v-if="filterOption === 'Active'"
                  name="checkmark_gray"
                />
              </template>
            </UiMenuButton>
            <UiMenuButton
              key="canceled"
              title="Canceled"
              :active="filterOption === 'Canceled'"
              @click="() => changeFilter('Canceled')"
            >
              <template #icon>
                <inlineSvg
                  v-if="filterOption === 'Canceled'"
                  name="checkmark_gray"
                />
              </template>
            </UiMenuButton>
          </template>
        </UiMenu>
      </div>
    </div>

    <div class="list-details">
      <VCExpressGeneration
        v-if="isExpressCardGenerationEnabled"
        ref="expressGenerationRef"
        @new-card-issued="emit('newCardIssued', $event)"
        @show-advanced-modal="emit('addCard')"
      />

      <div
        v-if="!loading && cards?.results?.length"
        class="list"
      >
        <CardSingle
          v-for="card in cards.results"
          :id="`card-${card.id}`"
          :key="card.id"
          :card="card"
          :sent="filterOption === 'Active'"
        />
      </div>

      <div v-if="!loading && cards.results.length === 0">
        <div
          v-if="isCanceledFilterActive"
          class="empty"
        >
          <p>No cards found</p>
        </div>
        <template v-else>
          <div
            v-if="!isExpressCardGenerationEnabled"
            class="list"
          >
            <VCNewCardSkeleton
              class="card"
              @click="emit('addCard')"
            />
          </div>
        </template>
      </div>
    </div>

    <div
      v-if="loading"
      class="loader"
    >
      <inlineSvg name="loading-small" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.cards {
  width: 400px;
  height: calc(100vh - 60px);
  overflow: hidden;
  position: fixed;

  @include custom-scroll-bar;

  padding-bottom: 30px;
  transition: all 0.4s ease-in-out;

  @include transform(translateX(0));

  border-right: 1px solid $color-primary-10;

  &.loaded {
    overflow: auto;
  }

  .title {
    position: sticky;
    top: 0;
    background-color: $color-base-white-100;
    z-index: 3;
    padding: 22px 22px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      color: $color-primary-100;
    }

    .sort-item {
      font-size: 12px;
      display: flex;
      align-items: center;
      cursor: pointer;

      &:first-of-type {
        margin-left: 10px;
      }

      .selected-sort-item {
        display: flex;
        align-items: center;
        border-radius: 8px;
        padding: 6px 8px;
        z-index: 99;

        &:hover {
          background: $color-primary-10;
        }

        span {
          color: $color-primary-50;
        }

        p {
          text-decoration: underline;
          font-weight: 500;
          margin: 0 6px 0 3px;
          color: $color-accent;
        }

        color: $color-accent;

        svg {
          margin-top: 2px;
        }
      }

      .filter-label {
        color: $color-primary-90;
      }

      .selected {
        color: $color-primary-10;
        font-weight: 600;
      }
    }
  }

  .list-details {
    padding: 7px 22px 0;
    position: relative;

    .list {
      .card {
        --distance: calc(222px - 95px);

        opacity: 0;
        animation: fade-in 0.3s;
        animation-fill-mode: forwards;

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

        @for $i from 1 through 20 {
          &:nth-child(#{$i}) {
            animation-delay: #{$i * 0.09}s;
          }
        }
      }
    }
  }

  .loader,
  .empty {
    width: 100%;
    height: calc(100vh - 179px);
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 24px;
      height: 24px;
      color: $color-primary-30;
    }

    p {
      font-size: 14px;
      font-weight: 400;
      color: $color-primary-70;
    }
  }
}
</style>
