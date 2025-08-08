<script setup>
import { computed, ref } from "vue";
import Button from "./WalletSettingsButton";
import { useRoute } from "vue-router";
import store from "@/store";
import SpendingLimitModal from "./SpendingLimitModal.vue";

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

const periodConversion = (period) => {
  if (period === "daily") {
    return "per day";
  } else if (period === "weekly") {
    return "per week";
  } else if (period === "monthly") {
    return "per month";
  } else if (period === "yearly") {
    return "per year";
  } else if (
    currentCard.value.transaction_period === "forever" &&
    currentCard.value.transaction_period_max_transactions === 2
  ) {
    return "one time";
  } else if (
    currentCard.value.transaction_period === "forever" &&
    currentCard.value.transaction_period_max_transactions !== 2
  ) {
    return "Up to";
  } else {
    return "unknown";
  }
};

const spendingLimit = computed(() => {
  return convertToDollar(currentCard.value.transaction_period_limit);
});

const title = computed(() => {
  if (
    currentCard.value.transaction_period === "forever" &&
    currentCard.value.transaction_period_max_transactions !== 2
  ) {
    return `${periodConversion(currentCard.value.transaction_period)} ${
      spendingLimit.value
    }`;
  } else {
    return `${spendingLimit.value} ${periodConversion(
      currentCard.value.transaction_period
    )}`;
  }
});

const renewalDate = computed(() => {
  if (currentCard.value.transaction_period === "daily") {
    return "renews tomorrow";
  } else if (currentCard.value.transaction_period === "weekly") {
    return "renews next week";
  } else if (currentCard.value.transaction_period === "monthly") {
    return "renews next month";
  } else if (currentCard.value.transaction_period === "yearly") {
    return "renews next year";
  } else if (
    currentCard.value.transaction_period === "forever" &&
    currentCard.value.transaction_period_max_transactions !== 2
  ) {
    return "Until card expires";
  } else if (
    currentCard.value.transaction_period === "forever" &&
    currentCard.value.transaction_period_max_transactions === 2
  ) {
    return "Single transaction";
  } else {
    return "unknown";
  }
});

const subtext = computed(() => {
  return `${renewalDate.value}`;
});

const loading = computed(() => {
  if (!currentCard.value) {
    return true;
  } else {
    return false;
  }
});

const show = ref(false);

function openModal() {
  show.value = true;
}

function closeModal() {
  show.value = false;
}
</script>

<template>
  <div>
    <Button
      :loading="loading"
      icon="spending-limit"
      text="Spending limit"
      :title="title"
      :subtext="subtext"
      clickable
      @click="openModal()"
    />

    <SpendingLimitModal
      :show="show"
      @close="closeModal()"
    />
  </div>
</template>
