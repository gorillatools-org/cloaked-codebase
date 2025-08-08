<script setup>
import { DOWNLOAD_APP_URL, AF_SIGNUP_URL } from "@/scripts/constants";
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import UiTile from "@/features/onboarding-new/UiTile.vue";
import store from "@/store";
import {
  HAS_ACTIVATED_PLUGIN,
  HAS_ACTIVATED_IOS,
  HAS_ACTIVATED_ANDROID,
} from "@/scripts/userFlags";
import { computed, onMounted, reactive } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import inlineSvg from "@/features/InlineSvg.vue";
import {
  PH_SCREEN_EVENT_ONBOARDING_EXIT_SCREEN,
  PH_EVENT_ONBOARDING_USER_CLICKED_EXIT_CONTINUE_BUTTON,
} from "@/scripts/posthogEvents";
import { isMobileDevice } from "@/scripts/regex";

const state = reactive({
  animateClose: false,
});

onMounted(() => {
  posthogCapture(PH_SCREEN_EVENT_ONBOARDING_EXIT_SCREEN);
});

const extensionInstalled = computed(() => {
  return (
    store.getters.getFlag(HAS_ACTIVATED_PLUGIN) ||
    store.getters["browser/pluginDetected"]
  );
});
const mobileInstalled = computed(() => {
  return (
    store.getters.getFlag(HAS_ACTIVATED_IOS) ||
    store.getters.getFlag(HAS_ACTIVATED_ANDROID)
  );
});

function navToHome() {
  state.animateClose = true;
  posthogCapture(PH_EVENT_ONBOARDING_USER_CLICKED_EXIT_CONTINUE_BUTTON);
}

function downloadExtension() {
  if (!extensionInstalled.value) {
    window.open(DOWNLOAD_APP_URL, "_blank");
  }
}

function downloadMobile() {
  if (!mobileInstalled.value) {
    if (isMobileDevice) {
      return window.open(AF_SIGNUP_URL, "_blank");
    } else {
      return store.dispatch("toggleMobileAppModal", true);
    }
  }
}
</script>

<template>
  <UiPageWrapper
    center
    :animateClose="state.animateClose"
    :screenEvent="PH_SCREEN_EVENT_ONBOARDING_EXIT_SCREEN"
  >
    <div class="flex-row inner-wrapper">
      <div class="left-side">
        <UiHeader>
          <h2 class="text-align">Before we send you on your way...</h2>
          <p class="text-align">
            Cloaked is here to protect you wherever you go. To get the most out
            of your subscription, make sure to check out the mobile app and
            extension.
          </p>
        </UiHeader>
        <UiButton
          gradient
          class="continue-button"
          width="231px"
          imgName="arrow-right"
          @click="navToHome"
        >
          Continue
        </UiButton>
      </div>
      <div class="right-side">
        <UiTile
          icon="mobile"
          :wrapperStyleOverride="{
            height: mobileInstalled ? '101px' : '173px',
            padding: '16.5px 24px',
          }"
          :completed="mobileInstalled"
          :statusText="mobileInstalled ? 'Installed' : undefined"
          @click="downloadMobile"
        >
          <p>Mobile app</p>
          <p
            v-if="!mobileInstalled"
            class="ui-tile-subtitle"
          >
            Protect your privacy and track data removal on the go
          </p>
          <div
            v-if="!mobileInstalled"
            class="flex-row download-row"
          >
            <img
              src="@/assets/images/qr-download.png"
              alt="Cloaked App QR Code"
              height="59"
              width="59"
            />
            <div class="mobile-button flex-row">
              {{ `${isMobileDevice ? "Click" : "Scan"} to download` }}
              <inlineSvg name="onboarding-new/apple-logo" />
              <inlineSvg name="onboarding-new/google-play-logo" />
            </div>
          </div>
        </UiTile>
        <UiTile
          icon="extension"
          :wrapperStyleOverride="{
            height: extensionInstalled ? '101px' : '132px',
            padding: '16.5px 24px',
          }"
          :statusText="extensionInstalled ? 'Installed' : 'Not installed'"
          :completed="extensionInstalled"
          @click="downloadExtension"
        >
          <p>Browser extension</p>
          <p
            v-if="!extensionInstalled"
            class="ui-tile-subtitle"
          >
            Generate new account info and autofill passwords on any site
          </p>
        </UiTile>
        <UiTile
          icon="dashboard"
          :wrapperStyleOverride="{ height: '101px', padding: '16.5px 24px' }"
          statusText="Logged in"
          completed
        >
          <p>Web dashboard</p>
        </UiTile>
      </div>
    </div>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.inner-wrapper {
  gap: 150px;

  @media (width <= 980px) {
    gap: 75px;
  }

  @media (width <= 850px) {
    gap: 50px;
    flex-direction: column;
    margin-top: 200px;
    padding-bottom: 50px;
  }

  .left-side {
    max-width: 388px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    @media (width <= 850px) {
      align-items: center;
    }
  }

  .right-side {
    max-width: 388px;
    display: flex;
    flex-direction: column;
    gap: 8.5px;
    align-items: center;
    justify-content: center;
    position: relative;
  }
}

.ui-tile-subtitle {
  font-size: 10.5px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  color: $color-primary-100;
  opacity: 0.5;
}

.mobile-button {
  width: 173px;
  border: 1px solid $color-primary-100;
  border-radius: 99px;
  gap: 8px;
  padding: 8px;

  svg {
    height: 21px;
    width: 21px;
  }
}

.download-row {
  position: absolute;
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 250px;
  left: 16px;
  bottom: 26px;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: $color-primary-100;
}

.continue-button {
  margin-top: 32px;

  // align-self: center !important;
}

.text-align {
  text-align: left;

  @media (width <= 850px) {
    text-align: center;
  }
}
</style>
