<script setup lang="ts">
import VCPillSettingsButton from "@/features/VirtualCards/Wallet/VCPillSettingsButton.vue";
import store from "@/store";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import VCPPillFundingSourceButton from "@/features/VirtualCards/Wallet/VCPillFundingSourceButton.vue";
import { posthogCapture } from "@/scripts/posthog";

const { openListModal, hasExpiredFundingSources } = useFundingSource();

const openFundingSourceModal = () => {
  posthogCapture("pay_wallet_funding_source_modal_viewed");
  openListModal();
};

const openSetting = () => {
  store.commit("openSettings");
};
</script>

<template>
  <div class="vc-wallet-header-actions">
    <VCPPillFundingSourceButton
      :color="hasExpiredFundingSources ? 'error' : 'default'"
      @click="openFundingSourceModal"
    />
    <VCPillSettingsButton
      label="Wallet Settings"
      @click="openSetting()"
    />
  </div>
</template>

<style lang="scss" scoped>
.vc-wallet-header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  gap: 10px;
}
</style>
