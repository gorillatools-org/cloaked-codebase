<script setup>
import Button from "./WalletSettingsButton";
import { computed } from "vue";
import store from "@/store";
import { useRoute } from "vue-router";

const route = useRoute();

const currentCard = computed(() => {
  if (route.params.id && store.state.cards.cards.results) {
    return store.state.cards.cards.results.find(
      (card) => card.id === route.params.id
    );
  } else {
    return "";
  }
});

function convertToDollar(amount) {
  return (amount / 100)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    .replace(/\.0+$/, "");
}

const isSingleUseCard = computed(() => {
  return (
    currentCard.value.spent_period > 0 &&
    currentCard.value.transaction_period_max_transactions === 1
  );
});

const title = computed(() => {
  if (!currentCard.value) {
    return `${convertToDollar(0)}`;
  }
  let amount =
    currentCard.value.transaction_period_limit - currentCard.value.spent_period;

  // Special handling for single-use cards
  if (isSingleUseCard.value) {
    // Nothing left to spend
    amount = 0;
  }
  return `${convertToDollar(amount)}`;
});

const remainingPercent = computed(() => {
  // Special handling for single-use cards
  if (isSingleUseCard.value) {
    // Nothing left to spend
    return 0;
  }

  // The normal multi-use cards
  return (
    ((currentCard.value.transaction_period_limit -
      currentCard.value.spent_period) /
      currentCard.value.transaction_period_limit) *
    100
  );
});

const loading = computed(() => {
  return !currentCard.value;
});
</script>

<template>
  <Button
    :loading="loading"
    icon="person-circle"
    text="Available funds"
    :title="title"
  >
    <div class="progress-bar">
      <div
        :key="currentCard.id"
        class="progress"
        :style="{ width: remainingPercent + '%' }"
        data-percent="remainingPercent"
      />
    </div>
  </Button>
</template>

<style lang="scss" scoped>
.progress-bar {
  width: 100%;
  height: 10px;
  background-color: $color-primary-20;
  border-radius: 4px;
  margin-top: 8px;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;

  .progress {
    height: 100%;
    width: 0;
    background-color: $color-primary-100;
    position: absolute;
    top: 0;
    left: 0;
    animation: width 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;

    @keyframes load {
      0% {
        width: 0%;
      }

      100% {
        width: attr(data-percent) "%";
      }
    }
  }

  .loading & {
    background-color: $color-primary-5;
  }
}
</style>
