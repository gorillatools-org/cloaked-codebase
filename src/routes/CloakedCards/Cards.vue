<script setup>
import store from "@/store";
import { computed } from "vue";
import Activate from "@/routes/CloakedCards/Activate.vue";
import List from "@/routes/CloakedCards/List.vue";

const kycValidated = computed(() => {
  return store.state.authentication?.user?.cloaked_card_kyc_configured;
});
</script>

<template>
  <section>
    <Activate v-if="!kycValidated" />
    <List v-else />
  </section>
</template>
