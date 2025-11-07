<script setup lang="ts">
import { computed } from "vue";
import Button from "@/features/Wallet/WalletSettings/WalletSettingsButton.vue";
import { useRoute } from "vue-router";
import store from "@/store";
import useVirtualCard from "@/features/VirtualCards/composables/useVirtualCard";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import useVirtualCardModals from "@/features/VirtualCards/composables/useVirtualCardModals";
import type { VirtualCard } from "@/types/Wallet/virtual-card";

const route = useRoute();
const { cardFundingSource } = useVirtualCard(() => currentCard.value);
const { openFundingSourcePatchModal } = useVirtualCardModals(
  () => currentCard.value
);

const { fundingSources } = useFundingSource();

const currentCard = computed(() => {
  if (route.params.id && store.state.cards.cards.results) {
    return store.state.cards.cards.results.find(
      (card: VirtualCard) => card.id === route.params.id
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
