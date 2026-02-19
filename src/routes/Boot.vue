<script setup>
import { useRoute } from "vue-router";

import store from "@/store";
import User from "@/routes/User.vue";
import router from "@/routes/router";
import { SUPPORTED_CARDS_COUNTRIES } from "@/scripts/constants.js";
import { appBoot, logout } from "@/scripts/actions/auth.js";
import Loading from "@/features/ui/loading.vue";
import CardsServices from "@/api/actions/cards-services.js";
import { dbMixin } from "@/mixins/db.js";

const route = useRoute();

import {
  reactive,
  onBeforeUnmount,
  nextTick,
  computed,
  watch,
  onMounted,
  onBeforeMount,
  ref,
} from "vue";

import { getPosthog } from "@/scripts/posthog";
import BannerDowntime from "@/features/banners/BannerDowntime.vue";
import { useScreen, SCREEN } from "@/composables/useScreen";
import { useScreenRouting } from "@/composables/useScreenRouting";
import DownloadApp from "@/features/onboarding/DownloadApp.vue";
import UserService from "@/api/actions/user-service";

const hasLoaded = ref(false);

onBeforeMount(() => {
  getPosthog().then(() => {
    store.dispatch("dataDelete/loadFeatureFlags");
  });
});

onMounted(async () => {
  await authCheck();
  window.addEventListener("logout", logoutListen);

  window.addEventListener("storage", (event) => {
    if (event.storageArea != localStorage) return;
    if (event.key === "vuex" && event.newValue) {
      try {
        const localToken =
          store.state.authentication?.auth?.access_token ?? null;
        const parsed = JSON.parse(event.newValue);
        const newAuth = parsed?.authentication ?? {};
        const newToken = newAuth?.auth?.access_token ?? null;

        if (localToken !== newToken && newAuth) {
          store.commit("authentication/replaceState", newAuth);
        }
      } catch (e) {
        console.warn("Failed to parse persisted vuex state", e);
      }
    }
  });
  nextTick(() => {
    hasLoaded.value = true;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("logout", logoutListen);
});

const state = reactive({
  offset: "",
  enablePay: !!route?.query?.enable_pay,
});

const subscription = computed(() => {
  return store.getters["settings/getSubscription"];
});

const overflow = computed(() => {
  return store.state.ui.bodyOverflowHidden;
});

const dbLoaded = computed(() => {
  return store.state.localdb.dbLoaded;
});

const rightPanelState = computed(() => {
  return store.getters["getRightPanelStatus"];
});

const authenticated = computed(() => {
  return store.getters.auth_token;
});

const user = computed(() => {
  return store.state.authentication?.user;
});

const shouldClipBody = computed(() => {
  return store.state.ui.open_dialog;
});

const userCountry = computed(() => {
  return user?.value?.country_at_registration
    ? user?.value?.country_at_registration
    : user?.value?.current_country;
});

const isSupportedCardCountry = computed(() => {
  return SUPPORTED_CARDS_COUNTRIES.includes(userCountry.value);
});

const canEnablePay = computed(() => {
  return (
    (store.getters["settings/isSubscribed"] ||
      store.getters["settings/isTrial"] ||
      store.getters["settings/isLegacy"]) &&
    isSupportedCardCountry.value
  );
});

watch(
  () => subscription.value,
  (newVal, oldVal) => {
    if (!oldVal && newVal) {
      nextTick(() => showPayModal());
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => rightPanelState.value,
  (value) => {
    if (value === true) {
      document.body.classList.add("active-right-panel");
    } else {
      document.body.classList.remove("active-right-panel");
    }
  }
);

watch(
  () => authenticated.value,
  (value) => {
    if (!value) {
      if (window.$posthog) {
        window.$posthog?.reset();
      }
      logout();
    }
  }
);

watch(
  () => user.value,
  (user) => {
    // If the user doesn't have a uuid, then we leave them anonymous,
    // otherwise we call identify so events are associated with the user.
    if (user?.posthog_uuid && window?.$posthog) {
      window.$posthog?.identify(
        store?.state?.authentication?.user?.posthog_uuid
      );
    }
  }
);

watch(
  () => shouldClipBody.value,
  (value) => {
    if (value) {
      state.offset = window.scrollY.toString();
    } else {
      const reset_top = parseInt(state.offset, 10);
      state.offset = 0;
      window.scrollTo(0, reset_top);
      setTimeout(() => {
        window.scrollTo(0, reset_top);
      }, 3);
    }
  }
);

watch(
  () => overflow.value,
  (value) => {
    if (value === true) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }
);

function showPayModal() {
  if (state.enablePay) {
    const newQuery = { ...route.query };
    delete newQuery.enable_pay;
    router.replace({
      query: newQuery,
    });
    if (canEnablePay.value) {
      CardsServices.enableSettings({
        enable_pay: route?.query?.enable_pay,
      }).then(() => {
        if (store.getters["settings/isTrial"]) {
          store.dispatch("openModal", {
            header: "Congratulations you're an early user for Cloaked Pay!",
            subheader:
              "To enable Cloaked Pay, please upgrade with this promo code <b>FAM2024</b> for 80% off the monthly subscription.",
            button: {
              text: "Upgrade now",
              onClick: () =>
                store.dispatch("subscription/openSubscriptionModal", {
                  promoCode: "FAM2024",
                  callback: () => router.push({ name: "VirtualCards" }),
                }),
            },
          });
        } else if (
          store.getters["settings/isSubscribed"] ||
          store.getters["settings/isLegacy"]
        ) {
          store.dispatch("openModal", {
            header: "Congrats, you got early access to Cloaked Pay",
            button: {
              text: "To Wallet page",
              onClick: () => router.push({ name: "VirtualCards" }),
            },
          });
        }
      });
    }
  }
}

function logoutListen() {
  logout();
}

async function checkLoaded() {
  await dbMixin.methods.frontLoadCloaks(true);

  nextTick(() => {
    store.dispatch("init");
  });
}

async function authCheck() {
  await appBoot();
  await checkLoaded();

  // Fetch features immediately after authentication and initialization
  // This ensures features data is available for all components that need it
  try {
    await store.dispatch("fetchFeatures");
  } catch (error) {
    console.warn("Failed to fetch features during boot:", error);
  }
}
onBeforeMount(() => {
  UserService.getFlags();
});

const { screen, isLoaded: isScreenLoaded } = useScreen();
useScreenRouting(screen);
</script>

<template>
  <div class="app">
    <BannerDowntime />
    <template v-if="hasLoaded && dbLoaded && isScreenLoaded">
      <DownloadApp
        v-if="screen === SCREEN.DOWNLOAD_MOBILE_APP"
        class="app-div"
      />
      <User
        v-else
        class="app-div"
      />
    </template>
    <Loading v-else />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
[data-lastpass-icon-root] {
  display: none !important;
}

/* stylelint-disable selector-max-id, selector-max-type, selector-max-class */
#app {
  height: 100dvh;

  .app-div {
    height: auto;

    .app-wrapper {
      height: auto;

      .content-container {
        height: auto;

        > div {
          height: 100%;
        }
      }
    }
  }

  @media screen and (min-width: $screen-md) {
    .app-div {
      height: 100%;

      .app-wrapper {
        height: 100%;

        .content-container {
          height: 100%;

          > div {
            height: 100%;
          }
        }
      }
    }
  }
}
/* stylelint-enable selector-max-id, selector-max-type, selector-max-class */

.highlight-text {
  font-weight: 600;
  color: $color-info;
}
</style>
