<script setup>
import { computed, onMounted } from "vue";
import store from "@/store";
import WaitlistView from "@/features/Wallet/WaitlistView.vue";

const user = computed(() => {
  return store.state.authentication?.user;
});

const payEnabled = computed(() => {
  return user?.value?.cloaked_card_enabled;
});

onMounted(() => {
  store.dispatch("authentication/getUser");
});
</script>

<template>
  <WaitlistView v-if="!payEnabled" />
</template>
