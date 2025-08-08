<script setup>
import { computed, onMounted } from "vue";
import store from "@/store";
import WalletActivity from "@/features/Wallet/WalletActivity.vue";
import KycFlow from "@/features/Wallet/KycFlow.vue";
import WaitlistView from "@/features/Wallet/WaitlistView.vue";

const user = computed(() => {
  return store.state.authentication?.user;
});

const payEnabled = computed(() => {
  return user?.value?.cloaked_card_enabled;
});

const kycValidated = computed(() => {
  return user.value?.cloaked_card_kyc_configured;
});
onMounted(() => {
  store.dispatch("authentication/getUser");
});
</script>

<template>
  <WalletActivity v-if="payEnabled && kycValidated" />
  <KycFlow v-else-if="payEnabled && !kycValidated" />
  <WaitlistView v-else />
</template>
