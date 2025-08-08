<script setup>
import { computed, onMounted } from "vue";

import store from "@/store";
import { useRoute } from "vue-router";
import Upgrade from "@/routes/guest/Upgrade";
import Boot from "@/routes/Boot";
import Guest from "@/routes/Guest";
import Shared from "@/routes/Shared";
import { auth_channel, refresh_channel, logout } from "@/scripts/actions/auth";
import Toast from "@/features/global/Toast.vue";
import { useColorScheme } from "@/composables/useColorScheme";

const route = useRoute();

const isOldExtension = computed(() => {
  return route?.query?.code;
});
const authenticated = computed(() => {
  return (
    store.getters["authentication/isAuthenticated"] &&
    !store.getters["authentication/isGuestAuthenticated"]
  );
});

const isExtension = computed(() => {
  return route.query.cloaked_client_id;
});

const share = computed(() => {
  return route.path.match(/share/gi);
});

onMounted(() => {
  const url = new URL(window.location.href);
  if (url.searchParams.get("isExtensionCommsDummy")) {
    return;
  }
  auth_channel.onmessage = () => {
    logout({ dontSendEvent: true });
  };
  refresh_channel.onmessage = () => {
    window.location.reload();
  };
  setSortType();
});

function setSortType() {
  let sortType = localStorage.getItem("identitySortType");
  if (!sortType) {
    sortType = "-created_at";
  }
  store.dispatch("setSortType", sortType);
}

const { colorScheme } = useColorScheme();
</script>

<template>
  <div :class="['app', `theme-${colorScheme}`]">
    <Upgrade v-if="isOldExtension" />
    <Shared v-else-if="share" />
    <Guest v-else-if="!authenticated || isExtension" />
    <Boot v-else />
    <Toast />
    <div id="root" />
    <div id="modals" />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
@import "@/assets/scss/main.scss";

.app {
  background-color: $color-base-white-100;
}
</style>
