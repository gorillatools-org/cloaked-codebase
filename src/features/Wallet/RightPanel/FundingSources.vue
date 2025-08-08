<script setup>
import { computed, markRaw } from "vue";
import store from "@/store";
import router from "@/routes/router";
import DetailSection from "@/features/Wallet/RightPanel/DetailSection.vue";
import PatchFundingSource from "@/features/modals/Wallet/PatchFundingSource.vue";

const sources = computed(() => {
  return store.state.cards?.fundingSources?.results;
});

const noSources = computed(() => {
  return sources.value.length === 0;
});

function description(source) {
  if (source.nickname) {
    return "•••• " + source.pan_last_four + " • " + source.nickname;
  } else {
    return "•••• " + source.pan_last_four;
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function openSource(source) {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(PatchFundingSource),
      props: {
        isVisible: true,
        source: source,
      },
    },
  });
}

const onDetailSectionClick = () => {
  router.push({ path: "/settings/cloaked-cards" });
};
</script>

<template>
  <div class="sources">
    <DetailSection
      v-if="noSources"
      title="No funding sources"
      description="Add a funding source to your wallet"
      icon="bank"
      link
      @click="onDetailSectionClick"
    />

    <DetailSection
      v-for="source in sources"
      :key="source.id"
      :title="capitalizeFirstLetter(source.card_brand)"
      :description="description(source)"
      icon="bank"
      link
      @click="openSource(source)"
    />
  </div>
</template>

<style scoped>
.sources {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
