<script setup>
import { computed, onMounted, watch } from "vue";
import * as Sentry from "@sentry/browser";

import store from "@/store";
import { useRoute } from "vue-router";
import Boot from "@/routes/Boot";
import Guest from "@/routes/Guest";
import Shared from "@/routes/Shared";
import { auth_channel, refresh_channel, logout } from "@/scripts/actions/auth";
import Toast from "@/features/global/Toast.vue";
import { useColorScheme } from "@/composables/useColorScheme";

const route = useRoute();

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
  return route.path?.match(/share/gi);
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
  store.dispatch("errors/fetchErrorCodes");
});

const sessionReplayEnabled = computed(() => {
  return !!store.getters["settings/getPermissions"]
    ?.permission_allow_session_replay;
});

function setSortType() {
  let sortType = localStorage.getItem("identitySortType");
  if (!sortType) {
    sortType = "-created_at";
  }
  store.dispatch("setSortType", sortType);
}

function initiateSentryReplay() {
  import("@sentry/browser").then((lazyLoadedSentry) => {
    Sentry.addIntegration(
      lazyLoadedSentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
        maskFn: (s) => (s.length >= 3 ? s.substring(0, 3) + "***" : s + "***"),
      })
    );
  });
}

const { colorScheme } = useColorScheme();

watch(
  () => sessionReplayEnabled.value,
  async (newVal, oldVal) => {
    const client = Sentry.getClient();
    const replay = client?.getIntegrationByName("Replay");
    if (newVal && !oldVal) {
      if (!replay) {
        initiateSentryReplay();
      }
    } else if (!newVal && oldVal) {
      if (replay) {
        await replay.stop();
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <div :class="['app', `theme-${colorScheme}`]">
    <Shared v-if="share" />
    <Guest v-else-if="!authenticated || isExtension" />
    <Boot v-else />
    <Toast />
    <div id="root" />
    <div id="modals" />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
@import "@/assets/scss/main.scss";

.app {
  background-color: $color-base-white-100;
}
</style>
