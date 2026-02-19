<script setup>
import store from "@/store";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_USER_CLICKED_DOWNLOAD_APP } from "@/scripts/posthogEvents.js";

function downloadMobile() {
  store.dispatch("toggleMobileAppModal", true);

  // Capture PostHog event
  posthogCapture(PH_EVENT_USER_CLICKED_DOWNLOAD_APP, {
    source: "home_download_mobile",
  });
}
</script>
<template>
  <section class="mobile-section">
    <img
      src="@/assets/images/logo-tile.png"
      alt="Cloaked Logo Tile"
      height="89"
      class="icon"
    />
    <BaseText
      as="h1"
      variant="headline-3-bold"
    >
      Download Cloaked for iOS and Android
    </BaseText>
    <BaseText
      as="h2"
      variant="headline-6-medium"
    >
      Hide your identity and inboxes anywhere you go.
    </BaseText>
    <BaseButton
      variant="secondary"
      full-width
      icon="arrow-down"
      class="button"
      @click="downloadMobile"
    >
      Download
    </BaseButton>
  </section>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.mobile-section {
  color: $color-primary-100;
  display: flex;
  padding: 24px;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  border-radius: 16px;
  border: 1px solid $color-primary-10;

  .icon {
    margin-top: -25px;
    margin-bottom: -25px;
  }

  .button {
    margin-top: 24px;
    > svg {
      height: 16px;
      width: 16px;
    }
  }
}
</style>
