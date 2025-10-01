<script setup>
import { snakeCase } from "lodash-es";
import { generatePkceRequirements } from "@/scripts/actions/auth";
import MountEvent from "@/features/MountEvent";
import UserService from "@/api/actions/user-service";
import { headers } from "@/api/api";
import store from "@/store";
import Loading from "@/features/ui/loading.vue";

import { ref, onUnmounted, nextTick, computed } from "vue";

import router from "@/routes/router";
import { useRoute } from "vue-router";

const route = useRoute();

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    default: null,
  },
  useLegacyRoute: {
    type: Boolean,
    default: false,
  },
  prevRoute: {
    type: String,
    default: "/",
  },
});

const intercept = ref(false);
const challenge = ref(null);
const verifier = ref(null);
const extension_challenge = ref(null);
const extension_verifier = ref(null);
const path = ref(props.source);
const keywindow = ref(null);
const iframeLoaded = ref(false);

function setHistory(pathValue) {
  const params = Object.keys(route.query).map((k) => `${k}=${route.query[k]}`);
  const query = params.join("&");
  window.history.pushState(
    {},
    null,
    query ? `${pathValue}?${query}` : pathValue
  );
}

function popstate(event) {
  event.preventDefault();
  if (intercept.value) {
    if (
      confirm(
        "Are you sure you want to exit? You will lose your current progress"
      )
    ) {
      intercept.value = false;
      // why is this source and not path?
      setHistory(props.source);
      nextTick(() => {
        window.location.reload();
      });
    }
  } else {
    const match = window.location.href?.match(/(auth\/[^/?]+)/);
    if (match) {
      const [, pathValue] = match;
      setHistory(pathValue);
    }
  }
}

onUnmounted(() => {
  window.removeEventListener("message", iframeListener);
  window.removeEventListener("popstate", popstate);
});

const isOldExtensionRequest = computed(() => {
  return (
    !!route.query?.cloaked_code_challenge && !!route.query?.cloaked_client_id
  );
});

function onMount() {
  window.addEventListener("beforeunload", (event) => {
    if (intercept.value) {
      event.preventDefault();
      intercept.value = false;
      event.returnValue = "";
    }
  });
  window.addEventListener("popstate", popstate);
  nextTick(() => {
    generatePkceRequirements().then(([verifierValue, challengeValue]) => {
      challenge.value = challengeValue;
      verifier.value = verifierValue;
    });
    if (!isOldExtensionRequest.value) {
      // NOTE: extension is not currently using this flow
      // all extension logins are using the old flow
      generatePkceRequirements().then(([verifierValue, challengeValue]) => {
        extension_challenge.value = challengeValue;
        extension_verifier.value = verifierValue;
      });
    }
  });
  window.addEventListener("message", iframeListener);
}

async function iframeListener(message) {
  const childWindow = keywindow?.value?.contentWindow;

  if (message.source === childWindow) {
    if (
      ["login-success", "migration-completed", "remind-later"].includes(
        message.data.event
      )
    ) {
      const payload = message.data.data;

      if (payload.user?.posthog_uuid && window?.$posthog) {
        window.$posthog?.identify(payload.user?.posthog_uuid);
      }
      await store.dispatch("authentication/setAuthPayload", {
        payload: message.data.data,
        client_id: import.meta.env.VITE_CLIENT_ID,
        codeVerifier: verifier.value,
      });

      await Promise.all([
        store.dispatch("authentication/getUser"),
        UserService.getFlags(),
      ]);

      if (!isOldExtensionRequest.value) {
        // NOTE: extension is not currently using this flow
        // all extension logins are using the old flow
        await store.dispatch("authentication/setExtensionToken", {
          payload: message.data.data,
          client_id: import.meta.env.VITE_EXTENSION_CLIENT_ID,
          codeVerifier: extension_verifier.value,
        });
      }
      router.push({ path: props.prevRoute }).catch((e) => e);
    }
    if (message.data.event === "url-change") {
      if (props.useLegacyRoute) {
        const routes = {
          "/auth/login": "/auth/v2/login",
          "/auth/signup": "/auth/v2/signup",
          "/auth/register": "/auth/v2/register",
          "/auth/forgot-password": "/auth/v2/forgot-password",
        };
        /* Forgot username is not included as there was not
        a legacy route for forgot username, page UI changes
        while still at the /login route */
        const route = Object.keys(routes).includes(message.data.data)
          ? routes[message.data.data]
          : message.data.data;
        if (!window.location.href?.includes(route)) {
          setHistory(route);
        }
      } else {
        if (!window.location.href?.includes(message.data.data)) {
          setHistory(message.data.data);
        }
      }
    }
    if (message.data.event === "user_is_editing") {
      intercept.value = true;
    }
    return;
  }
}

const src = computed(() => {
  const queries = Object.keys(route.query).map((k) => {
    return `${k}=${route.query[k]}`;
  });
  const getHeaders = headers();
  delete getHeaders["Authorization"];
  delete getHeaders["content-type"];
  let params = [
    `cloaked_client_id=${import.meta.env.VITE_CLIENT_ID}`,
    `cloaked_code_challenge=${challenge.value}`,
    `secret=${import.meta.env.VITE_SECRET}`,
    `cloaked_redirect_uri=${encodeURIComponent(
      import.meta.env.VITE_REDIRECT_URI
    )}`,
    ...queries,
  ];
  if (!isOldExtensionRequest.value) {
    params = [
      ...params,
      `cloaked_client_id=${import.meta.env.VITE_EXTENSION_CLIENT_ID}`,
      `cloaked_code_challenge=${extension_challenge.value}`,
      `secret=${import.meta.env.VITE_SECRET}`,
      `cloaked_redirect_uri=${encodeURIComponent(
        import.meta.env.VITE_REDIRECT_URI
      )}`,
    ];
  }
  Object.keys(getHeaders).map((k) => {
    params.push(`${snakeCase(k)}=${getHeaders[k]}`);
  });

  const deleteData = sessionStorage.getItem("data-delete");
  if (deleteData && path.value.includes("signup")) {
    params.push("enable_delete=true");
  }
  let newPath = path.value;
  if (newPath.includes("auth/register")) {
    newPath = "auth/signup";
  }
  newPath = newPath.replace("/auth", "auth");
  return `${import.meta.env.VITE_API}${newPath}/?${params.join("&")}`;
});
</script>
<template>
  <MountEvent @mounted="onMount">
    <Loading
      v-if="!iframeLoaded"
      class="iframe-loader"
    />
    <iframe
      v-if="challenge"
      :id="props.id || path"
      :key="path"
      ref="keywindow"
      :src="src"
      allow="clipboard-read; clipboard-write"
      frameborder="0"
      @load="iframeLoaded = true"
    />
  </MountEvent>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.iframe-loader {
  background-color: $color-background;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  border: none;
  width: 100vw;
  height: 100vh;
}
iframe {
  background-color: $color-background;
  position: absolute;
  top: 0;
  left: 0;
  border: none;
  width: 100vw;
  height: 100vh;
}
</style>
