<script setup>
import { reactive, onMounted } from "vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiTile from "@/features/onboarding-new/UiTile.vue";
import DataDeleteStatusBox from "@/features/onboarding-new/DataDeleteStatusBox.vue";
import router from "@/routes/router";
import { HAS_SEEN_DD_POST_PAYMENT_ONBOARDING } from "@/scripts/userFlags";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_ONBOARDING_USER_CLICKED_INTRO_FIRST_BUTTON,
  PH_EVENT_ONBOARDING_USER_CLICKED_INTRO_SECOND_BUTTON,
  PH_SCREEN_EVENT_ONBOARDING_INTRO_FIRST_SCREEN,
  PH_SCREEN_EVENT_ONBOARDING_INTRO_SECOND_SCREEN,
} from "@/scripts/posthogEvents";
import UserService from "@/api/actions/user-service";
import inlineSvg from "@/features/InlineSvg.vue";

const state = reactive({
  page: 1,
});

onMounted(() => {
  posthogCapture(PH_SCREEN_EVENT_ONBOARDING_INTRO_FIRST_SCREEN);
  UserService.setNewOnboardingFlag(HAS_SEEN_DD_POST_PAYMENT_ONBOARDING, true);
});

function navToOnboarding() {
  posthogCapture(PH_EVENT_ONBOARDING_USER_CLICKED_INTRO_SECOND_BUTTON);
  router.push({ name: "NewOnboardingGetStarted", query: { animate: false } });
}

function next() {
  posthogCapture(PH_EVENT_ONBOARDING_USER_CLICKED_INTRO_FIRST_BUTTON);
  posthogCapture(PH_SCREEN_EVENT_ONBOARDING_INTRO_SECOND_SCREEN);
  state.page = 2;
}
</script>
<template>
  <UiPageWrapper
    v-if="state.page === 1"
    center
    showLogo
    animate
    :screenEvent="PH_SCREEN_EVENT_ONBOARDING_INTRO_FIRST_SCREEN"
  >
    <UiHeader>
      <h1>
        Cloaked builds better privacy
        <i>with</i>
        you
      </h1>
      <h3 class="subtitle">
        Your Protection Plan helps improve every aspect of your online safety
        and security.
      </h3>
    </UiHeader>
    <UiButton
      gradient
      imgName="arrow-right"
      class="button"
      @click="next"
    >
      Build better privacy
    </UiButton>
  </UiPageWrapper>

  <UiPageWrapper
    v-else-if="state.page === 2"
    showLogo
    :screenEvent="PH_SCREEN_EVENT_ONBOARDING_INTRO_SECOND_SCREEN"
  >
    <UiHeader>
      <h1>Data removal is just the beginning</h1>
      <p>
        We've already started on your data removal but included in your Cloaked
        Protect Plan are even more features you can now explore.
      </p>
    </UiHeader>
    <UiTile
      completed
      statusText="Completed"
      icon="monitoring"
      class="ui-tile"
    >
      <p>Remove sensitive info from the web</p>
    </UiTile>
    <DataDeleteStatusBox class="status-box">
      <div class="status-box__name">
        <span>Removal in progress</span>
        <span><inlineSvg name="fuzzy-orange-dot" /></span>
      </div>
    </DataDeleteStatusBox>

    <UiButton
      gradient
      imgName="arrow-right"
      class="button"
      @click="navToOnboarding"
    >
      See what's included in your plan
    </UiButton>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 100%;
  height: 100%;
  align-self: center;
  text-align: center;
}

.subtitle {
  max-width: 500px;
}

.button {
  margin-top: 32px;
}

.ui-tile {
  margin-top: 48px;
  cursor: default !important;
}

.status-box {
  max-width: 343px;
  cursor: default !important;
  color: $color-primary-100;

  &__name {
    font-size: 15px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    color: $color-primary-100;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 9px;
    display: flex;

    span {
      > svg {
        margin-top: 6px;
      }
    }
  }
}
</style>
