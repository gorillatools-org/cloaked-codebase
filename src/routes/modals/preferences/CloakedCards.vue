<script setup>
import { computed } from "vue";
import store from "@/store";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel.vue";
import FundingSource from "@/routes/modals/preferences/CloakedCards/FundingSource.vue";
import CloakedCardsStatus from "@/routes/modals/preferences/CloakedCards/Status.vue";
const rightPanel = computed(() => {
  return store.state.ui.preference.right;
});
</script>

<template>
  <PreferencesPanel v-if="!rightPanel">
    <CloakedCardsStatus />
    <FundingSource />
  </PreferencesPanel>
</template>
