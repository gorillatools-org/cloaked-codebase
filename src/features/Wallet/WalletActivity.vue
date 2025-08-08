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

const route = useRoute();
const toast = useToast();

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
        router.push({ name: "Wallet" });
      });
  }

  watch(
    () => currentCard.value,
    () => {
      getCardInformation();
    }
  );

  document.body.classList.add("wallet");

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
});

onBeforeUnmount(() => {
  document.body.classList.remove("wallet");
});

const type = ref("Active");

function setType(payload) {
  type.value = payload.type;
}
</script>

<template>
  <section>
    <div>
      <CardsListing @type="setType" />
    </div>

    <main :class="{ rightPanel: rightPanelActive }">
      <div class="container">
        <WalletSettings
          :listType="type"
          :createCardDisabled="collectionsActive"
        />
        <TransactionsListing :listType="type" />
      </div>
    </main>

    <RightPanel :createCardDisabled="collectionsActive" />
  </section>
</template>

<style lang="scss" scoped>
section {
  width: 100%;
  display: flex;
  min-height: calc(100vh - 60px);
  position: relative;

  main {
    width: calc(100% - 399px);
    padding: 22px;
    position: relative;
    background-color: $color-base-white-100;
    transition: all 0.4s ease-in-out;
    left: 400px;

    .container {
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
    }
  }
}

.card-iframe {
  position: absolute;
  top: -9999px;
  left: -9999px;
  border: none;
  z-index: 1;
  width: 1px;
  height: 1px;
}
</style>
