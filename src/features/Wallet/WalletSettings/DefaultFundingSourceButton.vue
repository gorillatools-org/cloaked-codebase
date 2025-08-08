<script setup>
import { computed, ref, markRaw } from "vue";
import Button from "./WalletSettingsButton";
import store from "@/store";
import PatchDefaultFundingSource from "@/features/modals/Wallet/PatchDefaultFundingSource.vue";
import router from "@/routes/router/index.js";

const fundingSources = computed(() => {
  return store.state.cards?.fundingSources?.results;
});

const primaryCard = computed(() => {
  return fundingSources.value?.find((source) => source.primary) || [];
});

const subtext = computed(() => {
  const pan = "•••• " + primaryCard.value?.pan_last_four;
  const nickname = primaryCard.value?.nickname;

  if (pan && nickname) {
    return `${pan} • ${nickname}`;
  } else if (primaryCard.value?.pan_last_four) {
    return pan;
  } else {
    return null;
  }
});

const loading = ref(false);

const openDefaultFundingSources = () => {
  if ((store.state.cards?.fundingSources?.results?.length ?? 0) === 0) {
    router.push({ path: "/settings/cloaked-cards" });
    return;
  }

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(PatchDefaultFundingSource),
      props: {
        isVisible: true,
      },
    },
  });
};
</script>

<template>
  <Button
    :loading="loading"
    icon="bank"
    text="Default funding source"
    :title="primaryCard?.card_brand || 'Connect account'"
    :subtext="subtext || 'Bank account, Debit or Credit card'"
    clickable
    @click="openDefaultFundingSources"
  />
</template>
