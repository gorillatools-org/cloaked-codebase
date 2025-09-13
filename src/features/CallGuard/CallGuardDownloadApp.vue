<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";
import { useDisplay } from "@/composables/useDisplay";
import store from "@/store";

const props = defineProps<{
  isSetupComplete: boolean;
}>();

const { isMobile } = useDisplay();

function toggleDownloadAppModal() {
  if (isMobile.value) {
    window.open(DOWNLOAD_APP_URL, "_blank");
  } else {
    store.dispatch("toggleMobileAppModal", true);
  }
}
</script>

<template>
  <div class="call-guard-download-app">
    <BaseText
      variant="headline-4-medium"
      as="h2"
      class="call-guard-download-app__title"
    >
      Download Cloaked
    </BaseText>
    <BaseText
      variant="body-small-medium"
      as="p"
      class="call-guard-download-app__description"
    >
      {{
        props.isSetupComplete
          ? "Use the mobile app for the best experience using Call Guard or to make updates to your settings."
          : "Setting up Call Guard requires your mobile device."
      }}
    </BaseText>
    <BaseButton
      variant="secondary"
      size="md"
      icon="new-tab"
      full-width
      class="call-guard-download-app__button"
      @click="toggleDownloadAppModal"
    >
      Download Cloaked
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.call-guard-download-app {
  padding: 24px 16px 16px 16px;
  background-color: $color-base-white-100;
  border: 1px solid $color-primary-10;
  box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.05);
  border-radius: 12px;

  &__title {
    margin-bottom: 8px;
  }

  &__description {
    margin-bottom: 12px;
  }
}
</style>
