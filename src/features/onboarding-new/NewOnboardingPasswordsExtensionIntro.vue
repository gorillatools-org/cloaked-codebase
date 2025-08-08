<script setup>
import { DOWNLOAD_APP_URL, BUY_CLOAKED_URL } from "@/scripts/constants";
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import UiButtonRow from "@/features/onboarding-new/UiButtonRow.vue";
import { onMounted } from "vue";
import {
  PH_SCREEN_EVENT_ONBOARDING_PASSWORDS_EXT_INTRO_SCREEN,
  PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_INSTALL_EXT_BUTTON,
  PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_TRY_DEMO_BUTTON,
  PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_SKIP_EXT_BUTTON,
} from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";

onMounted(async () => {
  posthogCapture(PH_SCREEN_EVENT_ONBOARDING_PASSWORDS_EXT_INTRO_SCREEN);
});

const emit = defineEmits(["next"]);

function installExtension() {
  posthogCapture(PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_INSTALL_EXT_BUTTON);
  window.open(DOWNLOAD_APP_URL, "_blank");
}
function openDemo() {
  posthogCapture(PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_TRY_DEMO_BUTTON);
  window.open(BUY_CLOAKED_URL, "_blank");
}

function skipToEnd() {
  posthogCapture(PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_SKIP_EXT_BUTTON);
  emit("next", true);
}
</script>
<template>
  <UiPageWrapper
    :screenEvent="PH_SCREEN_EVENT_ONBOARDING_PASSWORDS_EXT_INTRO_SCREEN"
  >
    <UiHeader>
      <h2>Generate info, manage passwords and stay secure on any website</h2>
      <p>
        The Cloaked extension is the best way to protect your data anywhere you
        go online. Install it to automatically fill Cloaked identities and
        stored passwords or generate new ones on the fly.
      </p>
    </UiHeader>
    <div class="screenshot-wrapper">
      <img
        src="@/assets/images/onboarding-new/extension-screenshot.png"
        alt="Extension screenshot"
        class="screenshot"
      />
    </div>
    <UiButtonRow>
      <div class="flex-col-1">
        <div class="button-row-1">
          <UiButton
            width="217px"
            gradient
            imgName="arrow-ne"
            @click="installExtension"
          >
            Install Extension
          </UiButton>
          <UiButton
            width="217px"
            imgName="arrow-ne"
            @click="openDemo"
          >
            Try Demo
          </UiButton>
        </div>

        <div
          class="skip-button"
          @click="skipToEnd"
        >
          I already have a password manager
        </div>
      </div>
    </UiButtonRow>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.screenshot-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;

  .screenshot {
    margin-top: 45px;
  }
}

.flex-col-1 {
  color: $color-primary-100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;

  .skip-button {
    color: $color-primary-100;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    text-align: center;
    transition: opacity 0.3s;
    z-index: 1;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
      transition: opacity 0.3s;
    }
  }

  .button-row-1 {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 18px;
  }
}
</style>
