<script setup>
import { ref, markRaw } from "vue";
import store from "@/store";
import inlineSvg from "@/features/InlineSvg.vue";
import CardsServices from "@/api/actions/cards-services";
import MultiCardModal from "@/features/Wallet/MultiCardModal.vue";

const props = defineProps({
  outstandingBalance: {
    type: Number,
    required: true,
  },
});

async function getOBCards() {
  const cards = await CardsServices.getOutstandingBalanceCards();
  return JSON.parse(JSON.stringify(cards));
}

async function handleModalClose() {
  outstandingBalanceCards.value = await getOBCards();
}

const outstandingBalanceCards = ref(null);

outstandingBalanceCards.value = await getOBCards();

const currentCard = ref(null);

function selectCard(card) {
  currentCard.value = card.name;
}

function convertToDollar(amount) {
  return (amount / 100)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    .replace(/\\.0+$/, "");
}

function openMultiCardModal(card) {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(MultiCardModal),
      props: {
        show: true,
        card: card,
        outstandingBalance: card.outstanding_balance,
      },
      on: {
        close: () => {
          handleModalClose();
        },
      },
    },
  });
}
</script>

<template>
  <div class="payment-panel">
    <div class="header">
      <h2 class="outstanding-balance">
        Balance due: {{ convertToDollar(props.outstandingBalance) }}
      </h2>
    </div>
    <div class="card-breakdown">
      <div
        v-for="(card, index) in outstandingBalanceCards.data.results"
        :key="index"
        class="card-item"
        @click="selectCard(card)"
      >
        <div class="card-info">
          <div class="card-name">
            {{ card.identity_name }}
          </div>
        </div>
        <div class="balance-due">
          {{ convertToDollar(card.outstanding_balance) }}
        </div>
        <div
          class="arrow-icon"
          @click="openMultiCardModal(card)"
        >
          <inlineSvg name="chevron-right" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.payment-panel {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.card-breakdown {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
  background-color: $color-primary-100;
  cursor: pointer;
}

.card-info {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.card-name {
  font-weight: 500;
  font-size: 16px;
  width: 150px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.balance-due {
  font-size: 16px;
  color: #ff3b30;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  margin-left: auto;
}

.outstanding-balance {
  color: $color-primary-100;
}
</style>
