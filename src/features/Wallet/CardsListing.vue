<script setup>
import { ref, onMounted, computed, watch } from "vue";
import CardSingle from "./CardsListing/CardSingle";
import CardsServices from "@/api/actions/cards-services";
import store from "@/store";
import inlineSvg from "@/features/InlineSvg.vue";
import ReceivePaymentsPanel from "./ReceivePaymentsPanel.vue";
import UiMenu from "@/features/UiMenu/UiMenu.vue";
import UiMenuButton from "@/features/UiMenu/UiMenuButton.vue";

const emit = defineEmits(["type"]);

const cards = computed(() => {
  return store.state.cards.cards;
});

const loading = ref(true);

const receivePaymentsActive = ref(false);

const collection = computed(() => {
  return store.state.authentication?.user?.card_collections;
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

const active = computed(() => {
  return store.state.cards.rightPanel.show;
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

const fetchCardsForCurrentFilter = () => {
  if (filterOption.value === "Canceled") {
    cardsCanceled();
  } else if (filterOption.value === "Active") {
    cardsActive();
  }
};

onMounted(() => {
  fetchCardsForCurrentFilter();
});

const filterOption = ref("Active");

const changeFilter = (newFilter) => {
  filterOption.value = newFilter;
  emit("type", { type: newFilter });
};

watch(filterOption, fetchCardsForCurrentFilter);

const cardsActive = () => {
  loading.value = true;
  CardsServices.getCardList().then(() => {
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

onMounted(() => {
  receivePaymentsCheck();
});

watch(outstandingBalance, () => {
  receivePaymentsCheck();
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
      :outstandingBalance="outstandingBalance"
    />

    <div class="title">
      <h1>Cloaked cards</h1>

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

    <div
      v-if="cards?.results?.length"
      class="list-details"
    >
      <div
        v-if="!loading"
        class="list"
      >
        <CardSingle
          v-for="card in cards.results"
          :key="card.id"
          :card="card"
          :sent="filterOption === 'Active'"
        />
      </div>
    </div>

    <div
      v-if="loading"
      class="loader"
    >
      <inlineSvg name="loading-small" />
    </div>

    <div
      v-if="!cards?.results?.length && !loading"
      class="empty"
    >
      <p>No cards found</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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
        animation: fadein 0.3s;
        animation-fill-mode: forwards;

        @keyframes fadein {
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
