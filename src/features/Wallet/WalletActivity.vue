<script setup>
import TransactionsListing from "./TransactionsListing.vue";
import CardsListing from "./CardsListing.vue";
import WalletSettings from "./WalletSettings.vue";
import { useRoute } from "vue-router";
import { ref, onMounted, onBeforeUnmount, watch, computed, markRaw } from "vue";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import CardsServices from "@/api/actions/cards-services";
import RightPanel from "./RightPanel";
import ListStatements from "@/features/modals/Wallet/ListStatements.vue";
import router from "@/routes/router";
import { posthogCapture } from "@/scripts/posthog.js";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import GenerateCard from "@/features/modals/Wallet/GenerateCard.vue";
import VCBannerFundingSourcesExpired from "@/features/VirtualCards/VCBannerFundingSourcesExpired.vue";
import FundingSourceCardUpdateModal from "@/features/modals/Wallet/FundingSourceCardUpdateModal.vue";

const route = useRoute();
const toast = useToast();
const {
  openAddModal: openAddFundingSourceModal,
  fundingSources,
  hasExpiredFundingSources,
} = useFundingSource();

const cardsListingRef = ref(null);

const collection = computed(() => {
  return store.state.authentication?.user?.card_collections;
});

const collectionsActive = computed(() => {
  return (
    collection.value?.status === "active" ||
    collection.value?.status === "pending"
  );
});

const cards = computed(() => {
  return store.state.cards.cards;
});

const currentCard = computed(() => {
  if (route.params.id && cards.value.results) {
    return cards.value.results.find((card) => card.id === route.params.id);
  } else {
    return "";
  }
});

const rightPanelActive = computed(() => {
  return store.state.cards.rightPanel.show;
});

const cardUrl = ref("");

function getCardInformation() {
  cardUrl.value = "";
  store.commit("currentCard", "");
  if (
    currentCard.value.canceled !== true &&
    type.value === "Active" &&
    currentCard.value
  ) {
    CardsServices.getSingleIdentityCard(
      currentCard.value.identity_id || currentCard.value.identity,
      currentCard.value.id
    )
      .then(({ data }) => {
        cardUrl.value = data.url;
      })
      .catch((error) => {
        toast.error(error);
        cardUrl.value = "";
      });
  }
  if (type.value === "Gifted") {
    CardsServices.getSingleGiftCard(currentCard.value.id)
      .then(({ data }) => {
        cardUrl.value = data.url;
      })
      .catch((error) => {
        toast.error(error);
        cardUrl.value = "";
      });
  }
}

onMounted(() => {
  posthogCapture("dashboard_pay_wallet_home");

  if (route.params.id) {
    CardsServices.getSingleCard(route.params.id)
      .then(({ data }) => {
        currentCard.value = data;
      })
      .catch(() => {
        router.push({ name: "VirtualCards" });
      });
  }

  document.body.classList.add("wallet");

  getStatementsAndCheckStatementsQuery();
});

onBeforeUnmount(() => {
  document.body.classList.remove("wallet");
});

const type = ref("Active");

function setType(payload) {
  type.value = payload.type;
}

function getStatementsAndCheckStatementsQuery() {
  CardsServices.getStatements().then(() => {
    if (route.query?.statements === null) {
      store.dispatch("openModal", {
        customTemplate: {
          template: markRaw(ListStatements),
          props: {
            isVisible: true,
          },
        },
      });
    }
  });
}

function handleNewCardIssued(cardId) {
  cardsListingRef.value?.switchToActiveAndFetchCards().then(() => {
    // Auto-select the new card after fetching
    router.push(`/virtual-cards/card/${cardId}`);
  });
}

function handleAddCard(event) {
  if ((fundingSources.value?.length ?? 0) === 0) {
    openAddFundingSourceModal(() => {
      openCreateModal(event);
    });
    return;
  }

  openCreateModal(event);
}

const openCreateModal = (options) => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(GenerateCard),
      props: {
        isVisible: true,
        initialPeriod: options?.period,
        initialAmount: options?.amount,
        onNewCardIssued: (cardId) => {
          handleNewCardIssued(cardId);
        },
      },
    },
  });
};

const openUpdateFundingSourceModal = () => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(FundingSourceCardUpdateModal),
      props: {
        onClose: () => {
          console.log("onClose");
          router.push({ name: "VirtualCardsIndex" });
        },
      },
    },
  });
};

watch(
  () => route.query.statements,
  () => {
    if (route.query.statements === null) {
      getStatementsAndCheckStatementsQuery();
    }
  }
);

watch(
  () => currentCard.value,
  () => {
    getCardInformation();
  }
);

watch(
  () => route.name,
  (name) => {
    if (name === "VirtualCardsFundingSourceUpdate") {
      openUpdateFundingSourceModal();
    }
  },
  { immediate: true }
);
</script>

<template>
  <section class="wallet-activity">
    <div
      v-if="hasExpiredFundingSources"
      class="wallet-activity__banner-container"
    >
      <VCBannerFundingSourcesExpired />
    </div>
    <div class="wallet-activity__content">
      <div>
        <CardsListing
          ref="cardsListingRef"
          @type="setType"
          @add-card="handleAddCard"
          @new-card-issued="handleNewCardIssued"
        />
      </div>

      <main
        class="wallet-activity__main"
        :class="{ rightPanel: rightPanelActive }"
      >
        <div class="wallet-activity__main-container">
          <WalletSettings
            :list-type="type"
            :create-card-disabled="collectionsActive"
            @new-card-issued="handleNewCardIssued"
          />
          <TransactionsListing :list-type="type" />
        </div>
      </main>

      <RightPanel :create-card-disabled="collectionsActive" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.wallet-activity {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  position: relative;
  gap: 10px;

  &__banner-container {
    width: 100%;
    padding-inline: 22px;
  }

  &__content {
    display: flex;
    overflow-x: hidden;
  }

  &__main {
    width: calc(100% - 399px);
    padding: 22px;
    position: relative;
    background-color: $color-base-white-100;
    transition: all 0.4s ease-in-out;
    left: 400px;

    &-container {
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
    }
  }
}
</style>
