<script setup>
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import UiButtonRow from "@/features/onboarding-new/UiButtonRow.vue";
import router from "@/routes/router";
import { COMPLETED_DD_ONBOARDING_PASSWORD_GENERATOR } from "@/scripts/userFlags";
import UserService from "@/api/actions/user-service.js";
import { onMounted } from "vue";
import {
  PH_SCREEN_EVENT_ONBOARDING_PASSWORDS_IMPORT_SCREEN,
  PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_IMPORT_CONTINUE_BUTTON,
  PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_IMPORT_DO_MORE_BUTTON,
} from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";

defineEmits(["next"]);

onMounted(() => {
  posthogCapture(PH_SCREEN_EVENT_ONBOARDING_PASSWORDS_IMPORT_SCREEN);
  UserService.setNewOnboardingFlag(
    COMPLETED_DD_ONBOARDING_PASSWORD_GENERATOR,
    true
  );
});

function doMoreLater() {
  posthogCapture(
    PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_IMPORT_DO_MORE_BUTTON
  );
  router.push({ name: "NewOnboardingExit" });
}

function finish() {
  posthogCapture(
    PH_EVENT_ONBOARDING_USER_CLICKED_PASSWORDS_IMPORT_CONTINUE_BUTTON
  );
  router.push({ name: "NewOnboardingGetStarted" });
}
</script>
<template>
  <UiPageWrapper
    :screenEvent="PH_SCREEN_EVENT_ONBOARDING_PASSWORDS_IMPORT_SCREEN"
  >
    <UiHeader>
      <h2>Import your existing passwords</h2>
      <p>
        Use the Cloaked password manager to import your passwords from LastPass,
        1Password, Chrome, Brave and more. You can access this by clicking on
        your profile icon from the dashboard after you're finished with your set
        up.
      </p>
    </UiHeader>
    <img
      src="@/assets/images/onboarding-new/importer-screenshot.png"
      alt="Importer screenshot"
      class="screenshot"
      width="557"
    />
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
        @click="finish"
      >
        Continue setup
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.screenshot {
  margin-top: 45px;
}
</style>
