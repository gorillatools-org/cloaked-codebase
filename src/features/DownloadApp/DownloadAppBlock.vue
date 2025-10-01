<script setup>
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_USER_CLICKED_DOWNLOAD_APP } from "@/scripts/posthogEvents.js";

const openAppStore = () => {
  window.open("https://download.cloaked.com/", "_blank");

  // Capture PostHog event
  posthogCapture(PH_EVENT_USER_CLICKED_DOWNLOAD_APP, {
    source: "download_app_block",
  });
};
</script>

<template>
  <BaseSheet class="download-app-block">
    <div class="download-app-block__title">
      <BaseText
        variant="headline-4-medium"
        as="h4"
        class="download-app-block__title-text"
      >
        Download Cloaked Mobile
      </BaseText>
    </div>
    <div class="download-app-block__content">
      <BaseText
        variant="body-small-medium"
        as="p"
        class="download-app-block__content-text"
      >
        Enjoy push notifications about your data removal, access advanced mode,
        and instant access to new features.
      </BaseText>
    </div>
    <BaseButton
      variant="primary"
      class="download-app-block__button"
      icon="new-tab"
      @click="openAppStore"
    >
      Open App Store
    </BaseButton>
  </BaseSheet>
</template>

<style lang="scss" scoped>
.download-app-block {
  &__content {
    margin-top: 16px;
  }

  &__button {
    margin-top: 16px;
    width: 100%;
  }
}
</style>
