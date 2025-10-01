<script setup>
import { computed, ref } from "vue";
import Button from "./WalletSettingsButton";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import { CARD_LABEL_BY_PROVIDER_TYPE } from "@/scripts/constants.js";

const { openListModal, openAddModal, fundingSources } = useFundingSource();

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

const cardType = computed(() => {
  if (!primaryCard.value || !primaryCard.value.provider) return "Unknown";
  return CARD_LABEL_BY_PROVIDER_TYPE[primaryCard.value.provider];
});

const loading = ref(false);

const openDefaultFundingSources = () => {
  // No funding sources, open add modal
  if ((fundingSources.value?.length ?? 0) === 0) {
    openAddModal(() => {
      // UX: open list modal after confirmation of a new funding source
      openListModal(true);
    });
    return;
  }

  openListModal(true);
};
</script>

<template>
  <Button
    :loading="loading"
    icon="bank"
    text="Edit funding source"
    :title="`${primaryCard?.card_brand} (${cardType})` || 'Connect account'"
    :subtext="subtext || 'Bank account, Debit or Credit card'"
    clickable
    @click="openDefaultFundingSources"
  />
</template>
