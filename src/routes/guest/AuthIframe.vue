<script setup>
import { snakeCase } from "lodash-es";
import { generatePkceRequirements } from "@/scripts/actions/auth";
import MountEvent from "@/features/MountEvent";
import UserService from "@/api/actions/user-service";
import Loading from "@/features/ui/loading.vue";
import DownloadAppLegacy from "@/features/DownloadApp/DownloadAppLegacy.vue";
import { supportsWasm, isInAppBrowser } from "@/scripts/tools";
import { headers } from "@/api/api";
import store from "@/store";
import { PH_EVENT_USER_CLICKED_SIGN_UP_NO_WASM } from "@/scripts/posthogEvents";
import { AF_SIGNUP_URL } from "@/scripts/constants";
import { ref, onUnmounted, nextTick, computed, watch, onMounted } from "vue";

import router from "@/routes/router";
import { useToast } from "@/composables/useToast.js";
import { useRoute } from "vue-router";
import { useEncryptionGate } from "@/composables/useEncryptionGate";
import { posthogCapture } from "@/scripts/posthog";
import { useDisplay } from "@/composables/useDisplay";
import { isAndroid } from "@/scripts/regex";

const toast = useToast();

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
  useV3Route: {
    type: Boolean,
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
const iframeWrapper = ref(null);
const screenSize = ref({
  width: window.innerWidth,
  height: window.innerHeight,
});
const iframeDimensions = ref({
  width: "500px",
  height: "500px",
});

const errorFromBackend = ref(null);

const { isMobile } = useDisplay();

const urlParams = new URLSearchParams(window.location.search);
const developmentTrigger = urlParams.get("qa");
const shouldShowDownloadApp = computed(
  () =>
    (isMobile.value && isInAppBrowser && !supportsWasm()) ||
    (isMobile.value && (!supportsWasm() || errorFromBackend.value)) ||
    (isMobile.value && developmentTrigger)
);

const signupUrl = computed(() => {
  const url = AF_SIGNUP_URL;
  /* If we're on Android, attempt to open in system browser
  to avoid in-app browser limitations */
  if (isAndroid) {
    return `intent:${url}#Intent;end`;
  }
  return url;
});

const goToSignup = () => {
  window.location.href = signupUrl.value;
};

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
    const match = window.location.href?.match(/(auth\/[^?#]*)/);
    if (match) {
      const [, pathValue] = match;
      setHistory(pathValue);
    }
  }
}

const username = computed(
  () => store.getters["authentication/user"]?.credsFromOTP?.username
);

onMounted(() => {
  window.addEventListener("resize", resizeListener);
});

onUnmounted(() => {
  window.removeEventListener("message", iframeListener);
  window.removeEventListener("popstate", popstate);
  window.removeEventListener("resize", resizeListener);
});

const extensionCodeChallengeFromQuery = ref(
  route.query?.cloaked_code_challenge
);
const extensionClientIdeFromQuery = ref(route.query?.cloaked_client_id);
const extensionQueries = ref(route.query);

const isExtensionAuthV4 = computed(() => {
  return props.prevRoute.includes("extension-auth");
});

const isOldExtensionRequest = computed(() => {
  return (
    !!extensionCodeChallengeFromQuery.value &&
    !!extensionClientIdeFromQuery.value
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
    if (!isOldExtensionRequest.value && !isExtensionAuthV4.value) {
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
watch(iframeWrapper, (value) => {
  if (value) {
    iframeDimensions.value.width = `${value.clientWidth}px`;
    iframeDimensions.value.height = `${value.clientHeight}px`;
  }
});
watch(screenSize, () => {
  if (iframeWrapper.value) {
    iframeDimensions.value.width = `${iframeWrapper.value.clientWidth}px`;
    iframeDimensions.value.height = `${iframeWrapper.value.clientHeight}px`;
  }
});

const resizeListener = () => {
  screenSize.value = { width: window.innerWidth, height: window.innerHeight };
};

const { isEncryptionAvailable, isModalOpen } = useEncryptionGate();

async function iframeListener(message) {
  const childWindow = keywindow?.value?.contentWindow;

  if (message.source === childWindow) {
    if (message.data.event === "iframe-loaded") {
      const childWindow = keywindow?.value?.contentWindow;
      if (username.value) {
        // if user is coming from DD OTP screen and username = phone
        // auto submit username so they proceed to password screen
        childWindow?.postMessage(
          {
            event: "submit-username",
            data: {
              username: username.value,
            },
          },
          import.meta.env.VITE_API
        );
      }
    }

    if (
      ["login-success", "migration-completed", "remind-later"].includes(
        message.data.event
      )
    ) {
      if (message?.data?.data?.user?.is_passwordless) {
        store.commit(
          "authentication/setUsername",
          message.data.data.user.username
        );
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

      if (!isEncryptionAvailable.value && isOldExtensionRequest.value) {
        isModalOpen.value = true;
      }

      if (!isOldExtensionRequest.value && !isExtensionAuthV4.value) {
        // NOTE: extension is not currently using this flow
        // all extension logins are using the old flow
        await store.dispatch("authentication/setExtensionToken", {
          payload: message.data.data,
          client_id: import.meta.env.VITE_EXTENSION_CLIENT_ID,
          codeVerifier: extension_verifier.value,
        });
      }
      router.push(props.prevRoute).catch(() => {});
    }
    if (message.data.event === "url-change") {
      // Only update the URL if it's a different base route, not just a different ID
      const currentPath = window.location.pathname;
      const newPath = message.data.data;

      // Check if we're on a route with an ID (like /auth/join/UUID or /auth/reset-recovery-key/UUID)
      const currentHasId = currentPath.match(
        /^\/auth\/(join|reset-recovery-key)\/[^/]+/
      );
      const newIsBaseRoute = newPath.match(
        /^\/auth\/(join|reset-recovery-key)$/
      );

      // Don't change URL if we're on a route with ID and the iframe is reporting the base route
      if (currentHasId && newIsBaseRoute) {
        return;
      }

      if (props.useV3Route) {
        const routes = {
          "/auth/login": "/auth/v3/login",
          "/auth/signup": "/auth/v3/signup",
          "/auth/forgot-password": "/auth/v3/forgot-password",
          "/auth/forgot-username": "/auth/v3/forgot-username",
        };
        const route = Object.keys(routes).includes(message.data.data)
          ? routes[message.data.data]
          : message.data.data;
        if (!window.location.href?.match(new RegExp(route))) {
          setHistory(route);
        }
      } else {
        if (!window.location.href?.match(new RegExp(message.data.data))) {
          setHistory(message.data.data);
        }
      }
    }
    if (message.data.event === "go-to-login") {
      /* Store settings/recovery as previous path so we take
      the user there to download their new recovery key asap */
      router.push({
        name: "login",
        query: { prevRoute: "/settings/recovery" },
      });
    }
    if (message.data.event === "reset_recovery_key_sent") {
      toast.success("Email submitted");
    }
    if (message.data.event === "encryption-error") {
      /* If we get this error from auth, show the 'download the app screen' */
      errorFromBackend.value = true;
    }
    return;
  }
}

const src = computed(() => {
  const queries = Object.keys(extensionQueries.value).map((k) => {
    return `${k}=${extensionQueries.value[k]}`;
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
    `auth-version=3`,
    ...queries,
  ];

  if (!isOldExtensionRequest.value && !isExtensionAuthV4.value) {
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
  if (newPath.includes("auth/register") || newPath.includes("auth/sign-up")) {
    newPath = "auth/signup";
  } else if (newPath.includes("auth/reset-recovery-key")) {
    newPath = window.location.pathname.endsWith("/")
      ? window.location.pathname.slice(0, -1)
      : window.location.pathname;
  } else if (newPath.includes("auth/join")) {
    newPath = window.location.pathname.endsWith("/")
      ? window.location.pathname.slice(0, -1)
      : window.location.pathname;
  }

  newPath = newPath.replace("/auth", "auth");
  return `${import.meta.env.VITE_API}${newPath}/?${params.join("&")}`;
});
</script>

<template>
  <DownloadAppLegacy
    v-if="shouldShowDownloadApp"
    button-label="Sign up"
    :action="goToSignup"
    :posthog-event="PH_EVENT_USER_CLICKED_SIGN_UP_NO_WASM"
  />
  <MountEvent
    v-else
    @mounted="onMount"
  >
    <div class="layout-auth">
      <Loading
        v-if="!iframeLoaded"
        class="iframe-loader"
      />
      <div
        ref="iframeWrapper"
        class="iframe-wrapper"
      >
        <div
          v-if="iframeLoaded"
          class="auth-header"
        >
          <router-link
            v-if="path.includes('signup')"
            to="/auth/login"
            class="auth-header__link"
            @click="posthogCapture('auth_sign_up_to_login')"
          >
            Sign in
          </router-link>
          <router-link
            v-else
            to="/subscribe-now"
            class="auth-header__link"
            @click="posthogCapture('auth_login_to_sign_up')"
          >
            Sign up
          </router-link>
        </div>

        <iframe
          v-if="challenge"
          :id="props.id || path"
          :key="path"
          ref="keywindow"
          :src="src"
          allow="clipboard-read; clipboard-write; camera"
          frameborder="0"
          :style="{
            width: iframeDimensions.width,
            height: iframeDimensions.height,
          }"
          @load="iframeLoaded = true"
        />
      </div>
    </div>
  </MountEvent>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.layout-auth {
  height: 100dvh;
  background-color: $black;
}

.iframe-wrapper {
  position: relative;
  width: 100%;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.iframe-loader {
  background-color: $color-background-light;
  position: fixed;
  z-index: 2;
  top: 0;
  left: 0;
  border: none;
  width: 100vw;
  height: 100vh;
}
iframe {
  border: none;
}

iframe[id="auth/login"],
iframe[id="auth/forgot-password"],
iframe[id="auth/forgot-user-id"],
iframe[id="auth/reset-recovery-key"] {
  width: 100vw !important;
  height: 100% !important;

  @media screen and (min-width: $screen-md) {
    position: fixed;
    z-index: 1000;
    inset: 0 !important;
    height: 100vh !important;
  }
}

.auth-header {
  position: absolute;
  top: 0;
  left: 50%;
  @include transform(translateX(-50%));
  z-index: 10000;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  padding: 24px 32px;

  @media (min-width: 760px) {
    padding: 16px 24px;
  }

  @media (min-width: 1024px) {
    padding: 24px 32px;
  }

  .auth-header__link {
    color: #fff;
    font-family: inherit;
    font-size: 13px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    padding: 8px 32px;
    text-decoration: none;
    border: 1px solid #5e6165;
    border-radius: 100px;
    pointer-events: auto;
  }

  .auth-header__link:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>
