<script setup>
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import UiButtonRow from "@/features/onboarding-new/UiButtonRow.vue";
import router from "@/routes/router";
import UiInfoList from "@/features/onboarding-new/UiInfoList.vue";
import UiInfoTile from "@/features/onboarding-new/UiInfoTile.vue";
import { onMounted } from "vue";
import {
  PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_EXT_DO_MORE_BUTTON,
  PH_SCREEN_EVENT_ONBOARDING_PASSWORDS_EXT_OUTRO_SCREEN,
  PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_EXT_CONTINUE_BUTTON,
} from "@/scripts/posthogEvents";

import { posthogCapture } from "@/scripts/posthog.js";

const emit = defineEmits(["next"]);

onMounted(() => {
  posthogCapture(PH_SCREEN_EVENT_ONBOARDING_PASSWORDS_EXT_OUTRO_SCREEN);
});

function doMoreLater() {
  posthogCapture(PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_EXT_DO_MORE_BUTTON);
  router.push({ name: "NewOnboardingExit" });
}

function continueNext() {
  posthogCapture(
    PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_EXT_CONTINUE_BUTTON
  );
  emit("next");
}
</script>
<template>
  <UiPageWrapper
    :screenEvent="PH_SCREEN_EVENT_ONBOARDING_PASSWORDS_EXT_OUTRO_SCREEN"
  >
    <UiHeader>
      <h2>Extension Installed!</h2>
      <p>
        Here's just a few of the ways you can use the Cloaked extension. Give it
        a try!
      </p>
    </UiHeader>
    <UiInfoList class="margin-top">
      <UiInfoTile
        color="color-brand-3-100"
        icon="onboarding-new/play-tv"
      >
        Free trials
      </UiInfoTile>
      <UiInfoTile
        color="color-brand-6-100"
        icon="onboarding-new/newsletter"
      >
        Newsletters
      </UiInfoTile>
      <UiInfoTile
        color="color-brand-1-100-light"
        icon="onboarding-new/percent"
      >
        Discount codes
      </UiInfoTile>
      <UiInfoTile
        color="color-brand-5-100"
        icon="onboarding-new/shopping-cart"
      >
        Easy checkouts
      </UiInfoTile>
      <UiInfoTile
        color="color-in-progress"
        icon="key-filled"
      >
        Password manager
      </UiInfoTile>
      <UiInfoTile
        color="color-brand-4-100"
        icon="onboarding-new/tools"
      >
        Online services
      </UiInfoTile>
    </UiInfoList>
    <UiButtonRow>
      <UiButton
        width="217px"
        @click="doMoreLater"
      >
        I'll do more later
      </UiButton>
      <UiButton
        width="217px"
        gradient
        imgName="arrow-right"
        @click="continueNext"
      >
        Continue setup
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>
</template>
