<script setup>
import { computed, markRaw } from "vue";
import Button from "./WalletSettingsButton";
import { useRoute } from "vue-router";
import store from "@/store";
import PatchCurrentFundingSource from "@/features/modals/Wallet/PatchCurrentFundingSource.vue";
import router from "@/routes/router/index.js";

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

const fundingSources = computed(() => {
  return store.state.cards.fundingSources.results;
});

const hasFundingSources = computed(() => {
  return (store.state.cards.fundingSources?.results?.length ?? 0) > 0;
});

const currentCardFundingSource = computed(() => {
  if (hasFundingSources.value && currentCard.value?.funding_source) {
    return fundingSources.value.find(
      (source) => source.id === currentCard.value.funding_source
    );
  } else {
    return null;
  }
});

const currentCardType = computed(() => {
  return currentCardFundingSource.value?.type;
});

const fundingSourcesFiltered = computed(() => {
  return store.state.cards.fundingSources.results.filter(
    (source) => source.type === currentCardType.value
  );
});

const subtext = computed(() => {
  const pan = "•••• " + lastFourDigits();
  const note = currentCardFundingSource.value?.note;

  if (pan && note) {
    return `${pan} • ${note}`;
  } else if (currentCardFundingSource.value?.pan_last_four) {
    return pan;
  } else {
    return null;
  }
});

const loading = computed(() => {
  return !currentCardFundingSource.value && hasFundingSources.value;
});

function lastFourDigits() {
  const pan = currentCardFundingSource.value?.pan_last_four;
  if (pan) {
    return pan.slice(-4);
  } else {
    return null;
  }
}

const openFundingSources = () => {
  if (!hasFundingSources.value) {
    router.push("/settings/cloaked-cards");
    return;
  }

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(PatchCurrentFundingSource),
      props: {
        isVisible: true,
        sources: fundingSourcesFiltered.value,
        currentSource: currentCardFundingSource.value,
        currentCardID: currentCard.value.id,
      },
    },
  });
};
</script>

<template>
  <Button
    :loading="loading"
    icon="bank"
    text="Funding source"
    :title="currentCardFundingSource?.card_brand || 'Unknown'"
    :subtext="subtext || 'Unknown'"
    @click="openFundingSources"
  />
</template>
