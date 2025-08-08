<script setup>
import { ref, markRaw, computed, watch } from "vue";
import Button from "./WalletSettingsButton";
import { useRoute } from "vue-router";
import store from "@/store";
import GenerateCard from "@/features/modals/Wallet/GenerateCard.vue";
import router from "@/routes/router/index.js";

const route = useRoute();

const generating = ref(false);

const cardSettings = computed(() => {
  return store.state.cards?.cardSettings;
});

function createNewIdentity() {
  if ((store.state.cards?.fundingSources?.results?.length ?? 0) === 0) {
    router.push("settings/cloaked-cards");
    return;
  }

  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(GenerateCard),
      props: {
        isVisible: true,
      },
    },
  });
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
    cardSettings?.value?.period === "forever" &&
    cardSettings?.value?.num_transactions === 2
  ) {
    return "one time";
  } else if (
    cardSettings?.value?.period === "forever" &&
    cardSettings?.value?.num_transactions !== 2
  ) {
    return "Up to";
  } else {
    return "unknown";
  }
};

const dollars = ref(convertToDollar(cardSettings?.value?.spending_limit));

const spending_limit_exists = computed(() => {
  return cardSettings?.value?.spending_limit;
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
  if (!spending_limit_exists.value) {
    return "No spending limit. Please add a funding source.";
  } else if (
    cardSettings?.value?.period === "forever" &&
    cardSettings?.value?.num_transactions !== 2
  ) {
    return `You can spend up to ${dollars.value}.`;
  } else if (
    cardSettings?.value?.period === "forever" &&
    cardSettings?.value?.num_transactions === 2
  ) {
    return `You can make a single ${dollars.value} transaction.`;
  } else {
    return `You can spend up to ${dollars.value} ${periodConversion(
      cardSettings?.value?.period
    )}.`;
  }
});

watch(cardSettings, () => {
  dollars.value = convertToDollar(cardSettings?.value.spending_limit);
});
</script>

<template>
  <Button
    v-if="!route.params.id"
    clickable
    :icon="generating ? 'loading-small' : 'plus'"
    text="Generate"
    title="New card"
    :subtext="title"
    :class="{ generating: generating }"
    @click="createNewIdentity()"
  />
</template>

<style lang="scss" scoped>
.generating {
  &.button {
    background: $color-primary-10;
    color: $color-primary-100;
    border-color: $color-primary-10;
    pointer-events: none;
  }
}
</style>
