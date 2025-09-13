<script setup>
import { useRoute } from "vue-router";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";
import { onMounted } from "vue";
import DownloadApp from "@/features/onboarding/DownloadApp.vue";

const route = useRoute();

onMounted(() => {
  let queryParams = "";
  if (route.query) {
    queryParams = Object.entries(route.query)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
  }

  window.location.href = DOWNLOAD_APP_URL + "?" + queryParams;
});
</script>

<template>
  <div>
    <DownloadApp />
  </div>
</template>
