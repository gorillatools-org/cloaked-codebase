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

const title = computed(() => {
  const period = currentCard.value.transaction_period;

  switch (period) {
    case "daily":
      return `${spendingLimit.value} per day`;
    case "weekly":
      return `${spendingLimit.value} per week`;
    case "monthly":
      return `${spendingLimit.value} per month`;
    case "yearly":
      return `${spendingLimit.value} per year`;
    case "forever":
      // One-time
      if (currentCard.value.transaction_period_max_transactions === 1) {
        return `${spendingLimit.value}`;
      } else {
        return `${currentCard.value.transaction_period_max_transactions} uses up to ${spendingLimit.value}`;
      }
    default:
      return "unknown";
  }
});

const spendingLimit = computed(() => {
  return convertToDollar(currentCard.value.transaction_period_limit);
});

const renewalDate = computed(() => {
  const period = currentCard.value.transaction_period;

  switch (period) {
    case "daily":
      return `Renews tomorrow`;
    case "weekly":
      return `Renews next week`;
    case "monthly":
      return `Renews next month`;
    case "yearly":
      return `Renews next year`;
    case "forever":
      // One-time
      if (currentCard.value.transaction_period_max_transactions === 1) {
        return `One-time`;
      } else {
        return `Until card expires`;
      }
    default:
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
