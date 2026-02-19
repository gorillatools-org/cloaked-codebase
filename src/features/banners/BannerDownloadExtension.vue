<script setup>
import { DOWNLOAD_APP_URL } from "@/scripts/constants";
import AtomTopBanner from "@/library/AtomTopBanner.vue";
import AtomTopBannerButton from "@/library/AtomTopBannerButton.vue";

const emit = defineEmits(["dismiss"]);

function dismissBanner() {
  localStorage.setItem("showExtensionBanner", "false");
  emit("dismiss");
}
</script>
<template>
  <AtomTopBanner variant="warning">
    Your account is not complete. Download the Cloaked extension to finish
    setup.
    <AtomTopBannerButton
      as="a"
      :href="DOWNLOAD_APP_URL"
      target="_blank"
    >
      Download extension
    </AtomTopBannerButton>
    <AtomTopBannerButton @click="dismissBanner">
      Remind me later
    </AtomTopBannerButton>
  </AtomTopBanner>
</template>
