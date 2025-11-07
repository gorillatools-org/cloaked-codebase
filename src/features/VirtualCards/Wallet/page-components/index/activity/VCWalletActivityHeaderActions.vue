<script setup lang="ts">
import VCPillSettingsButton from "@/features/VirtualCards/Wallet/VCPillSettingsButton.vue";
import store from "@/store";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_VIRTUAL_CARDS_FEATURE_FLAG_EXPRESS_CARD_GENERATION } from "@/features/VirtualCards/constants/posthog-feature-flag";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import VCPPillFundingSourceButton from "@/features/VirtualCards/Wallet/VCPillFundingSourceButton.vue";
import { posthogCapture } from "@/scripts/posthog";

const { featureFlag: isExpressCardGenerationEnabled } = usePostHogFeatureFlag(
  PH_VIRTUAL_CARDS_FEATURE_FLAG_EXPRESS_CARD_GENERATION
);

const { openListModal, hasExpiredFundingSources } = useFundingSource();

const openFundingSourceModal = () => {
  posthogCapture("dashboard_pay_wallet_funding_source_modal_viewed");
  openListModal();
};

const openSetting = () => {
  store.commit("openSettings");
};
</script>

<template>
  <div class="vc-wallet-header-actions">
    <VCPPillFundingSourceButton
      v-if="isExpressCardGenerationEnabled"
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
