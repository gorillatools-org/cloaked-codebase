<script setup>
import { DOWNLOAD_APP_URL } from "@/scripts/constants.js";
import BaseButton from "@/library/BaseButton.vue";
import { onMounted, computed } from "vue";
import { PH_EVENT_USER_VIEWED_SETUPONBOARDING_DOWNLOAD_APP } from "@/scripts/posthogEvents.js";
import { logout } from "@/scripts/actions/auth.js";
import { posthogCapture } from "@/scripts/posthog.js";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
import CloakedLogo from "@/assets/icons/cloaked-logo-full.svg";
import store from "@/store";

const props = defineProps({
  buttonLabel: {
    type: String,
    default: "Sign out",
  },
  action: {
    type: Function,
    default: () => logout(),
  },
  posthogEvent: {
    type: String,
    default: PH_EVENT_USER_VIEWED_SETUPONBOARDING_DOWNLOAD_APP,
  },
});

const username = computed(() => store.getters["authentication/getUsername"]);

onMounted(() => {
  posthogCapture(props.posthogEvent);
});
</script>

<template>
  <div class="download-app">
    <div class="download-app__header">
      <CloakedLogo class="download-app__logo" />
      <BaseButton
        variant="outline"
        @click="props.action"
      >
        {{ props.buttonLabel }}
      </BaseButton>
    </div>
    <div class="download-app__content">
      <BaseText
        as="h1"
        variant="headline-2-semibold"
        class="download-app__title"
      >
        Download Cloaked to continue
      </BaseText>
      <BaseText variant="body-2-semibold">
        Your account has been set up. Make sure to Sign In using
        <strong>{{ username }}</strong>
        as your username to access your subscription.
      </BaseText>
      <img
        src="@/assets/images/onboarding/download-app.webp"
        width="500"
        height="512"
        alt="Download App"
        class="download-app__image"
      />
      <a
        class="download-app__link"
        :href="DOWNLOAD_APP_URL"
        target="_blank"
      >
        <BaseText variant="headline-5-bold">Download</BaseText>
        <InlineSvg
          name="arrow-down"
          class="download-app__link-icon"
        />
      </a>
      <router-link
        to="/settings/subscription"
        class="download-app__manage-subscription"
      >
        <BaseText variant="body-2-semibold">Manage subscription</BaseText>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.download-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  overflow: visible;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-color: $color-base-white-100;

  &__header {
    padding: 20px 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    max-width: 1200px;
  }

  &__logo {
    color: $color-primary-100;
    height: 25px;
    width: 100px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 40px 20px;
    position: relative;
    margin: auto;
  }

  &__title {
    color: $color-primary-100;
    text-align: center;
  }

  &__image {
    max-width: 400px;
    width: 100%;
  }

  &__link {
    background: $cloaked-gradient;
    border: none;
    color: $color-primary-1;
    padding: 20px 40px;
    border-radius: 100px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    max-width: 275px;
    width: 100%;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      z-index: 1;
      inset: 0;
    }

    &-icon {
      flex-shrink: 0;
    }
  }

  &__manage-subscription {
    color: $color-primary-100;
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
