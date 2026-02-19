<script setup lang="ts">
import { onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import WalletStatusSection, {
  type WalletStatusSectionProps,
} from "@/features/Wallet/WalletStatusSection.vue";

const statusSectionProps: WalletStatusSectionProps = {
  medallion: {
    size: "lg",
    color: "error",
    icon: "info",
  },
  title: "Something went wrong",
  description:
    "Please refresh or try again in a few minutes. If the problem continues, contact Cloaked Support. ",
  primaryButtonText: "Refresh page",
  showCopySupportEmail: true,
};

onMounted(() => {
  posthogCapture(`pay_fallback_page_viewed`);
});

async function refreshPage() {
  await posthogCapture(`pay_fallback_page_refresh_button_tapped`);
  window.location.reload();
}

function handleSupportEmailCopied() {
  posthogCapture(`pay_fallback_page_support_email_copied`);
}
</script>

<template>
  <div class="vc-fallback-section">
    <WalletStatusSection
      v-bind="statusSectionProps"
      :description-max-width="550"
      @primary-button-click="refreshPage"
      @support-email-copied="handleSupportEmailCopied"
    />
  </div>
</template>

<style scoped lang="scss">
.vc-fallback-section {
  height: 100%;
}
</style>
