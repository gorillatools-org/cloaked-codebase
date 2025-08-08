<script setup>
import store from "@/store";
import { onBeforeMount } from "vue";
import AtomTopBanner from "@/library/AtomTopBanner.vue";
import AtomTopBannerButton from "@/library/AtomTopBannerButton.vue";

function upgradeModal() {
  store.dispatch("subscription/openSubscriptionModal");
}

onBeforeMount(() => {
  store.dispatch("subscription/init");
});
</script>

<template>
  <AtomTopBanner variant="cloaked">
    <span>
      Your managed Cloaked plan has expired.
      <AtomTopBannerButton @click="upgradeModal">
        Subscribe today
      </AtomTopBannerButton>
    </span>
  </AtomTopBanner>
</template>
