<script setup>
import { computed } from "vue";
import Button from "./WalletSettingsButton";
import { useRoute } from "vue-router";
import store from "@/store";
import useVirtualCard from "@/composables/Wallet/useVirtualCard";
import useFundingSource from "@/composables/Wallet/useFundingSource";

const route = useRoute();
const { openFundingSourcePatchModal, cardFundingSource } = useVirtualCard(
  () => currentCard
);
const { fundingSources } = useFundingSource();

const currentCard = computed(() => {
  if (route.params.id && store.state.cards.cards.results) {
    return store.state.cards.cards.results.find(
      (card) => card.id === route.params.id
    );
  } else {
    return "";
  }
});

const subtext = computed(() => {
  const pan = "•••• " + lastFourDigits();
  const note = cardFundingSource.value?.note;

  if (pan && note) {
    return `${pan} • ${note}`;
  } else if (cardFundingSource.value?.pan_last_four) {
    return pan;
  } else {
    return null;
  }
});

const loading = computed(() => {
  return !cardFundingSource.value || !fundingSources.value?.length;
});

function lastFourDigits() {
  const pan = cardFundingSource.value?.pan_last_four;
  if (pan) {
    return pan.slice(-4);
  } else {
    return null;
  }
}
</script>

<template>
  <Button
    :loading="loading"
    icon="bank"
    text="Funding source"
    :title="cardFundingSource?.card_brand || 'Unknown'"
    :subtext="subtext || 'Unknown'"
    @click="openFundingSourcePatchModal"
  />
</template>
