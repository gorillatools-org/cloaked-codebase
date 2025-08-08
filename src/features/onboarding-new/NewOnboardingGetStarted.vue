<script setup>
import { computed, onBeforeMount, onMounted, ref } from "vue";
import UiTile from "@/features/onboarding-new/UiTile.vue";
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import router from "@/routes/router";
import store from "@/store";
import {
  PH_EVENT_ONBOARDING_USER_CLICKED_MAIN_GEN_INFO_BUTTON,
  PH_EVENT_ONBOARDING_USER_CLICKED_MAIN_BREACHES_BUTTON,
  PH_EVENT_ONBOARDING_USER_CLICKED_MAIN_PASSWORDS_BUTTON,
  PH_SCREEN_EVENT_ONBOARDING_MAIN_SCREEN,
  PH_FEATURE_ENABLE_BREACHES_FLOW_ENABLED,
} from "@/scripts/posthogEvents";
import {
  COMPLETED_DD_ONBOARDING_PHONE_EMAIL,
  COMPLETED_DD_ONBOARDING_DATA_BREACHES,
  COMPLETED_DD_ONBOARDING_PASSWORD_GENERATOR,
  COMPLETED_DD_ONBOARDING_INVITE_FLOW,
} from "@/scripts/userFlags";
import UserService from "@/api/actions/user-service";
import inlineSvg from "@/features/InlineSvg.vue";
import { useRoute } from "vue-router";
import { posthogCapture } from "@/scripts/posthog.js";
import { usePlans } from "@/features/subscribe/composables/usePlans";

const route = useRoute();

const animate = ref(false);

onBeforeMount(() => {
  if (route.query.animate === "true") {
    animate.value = true;
  }
  router.replace({
    query: null,
  });
});

onMounted(() => {
  UserService.getNewOnboardingFlags();
  posthogCapture(PH_SCREEN_EVENT_ONBOARDING_MAIN_SCREEN);
});

const { activePlan } = usePlans();

const canInviteMembers = computed(
  () =>
    store.getters["settings/getSubscription"]?.owner &&
    activePlan.value?.max_members > 1
);

const inviteCompleted = computed(() => {
  return (
    !canInviteMembers.value ||
    store.getters.getNewOnboardingFlag(COMPLETED_DD_ONBOARDING_INVITE_FLOW)
  );
});

const phoneAndEmailCompleted = computed(() => {
  return store.getters.getNewOnboardingFlag(
    COMPLETED_DD_ONBOARDING_PHONE_EMAIL
  );
});

const dataBreachesFlowEnabled = computed(() => {
  return (
    store.state.authentication?.user?.flags &&
    store.state.authentication?.user?.flags[
      PH_FEATURE_ENABLE_BREACHES_FLOW_ENABLED
    ]
  );
});

const dataBreachesCompleted = computed(() => {
  if (dataBreachesFlowEnabled.value) {
    return store.getters.getNewOnboardingFlag(
      COMPLETED_DD_ONBOARDING_DATA_BREACHES
    );
  }
  return true;
});

const passwordCompleted = computed(() => {
  return store.getters.getNewOnboardingFlag(
    COMPLETED_DD_ONBOARDING_PASSWORD_GENERATOR
  );
});

const allFlowsCompleted = computed(() => {
  return (
    inviteCompleted.value &&
    phoneAndEmailCompleted.value &&
    dataBreachesCompleted.value &&
    passwordCompleted.value
  );
});

function navToExitScreen() {
  router.push({ name: "NewOnboardingExit" });
}

function navTo(screenName) {
  switch (screenName) {
    case "NewOnboardingPhoneEmail":
      posthogCapture(PH_EVENT_ONBOARDING_USER_CLICKED_MAIN_GEN_INFO_BUTTON);
      break;
    case "NewOnboardingBreaches":
      posthogCapture(PH_EVENT_ONBOARDING_USER_CLICKED_MAIN_BREACHES_BUTTON);
      break;
    case "NewOnboardingPasswords":
      posthogCapture(PH_EVENT_ONBOARDING_USER_CLICKED_MAIN_PASSWORDS_BUTTON);
      break;
  }
  router.push({ name: screenName });
}
</script>
<template>
  <UiPageWrapper
    showLogo
    :screenEvent="PH_SCREEN_EVENT_ONBOARDING_MAIN_SCREEN"
    :animate="animate"
    :showFireworks="allFlowsCompleted"
  >
    <div>
      <UiHeader>
        <h1>Set up your Cloaked protection plan</h1>
      </UiHeader>
      <div class="tile-block">
        <UiTile
          v-if="canInviteMembers"
          :completed="inviteCompleted"
          icon="invite"
          class="ui-tile"
          :statusText="inviteCompleted ? 'Invited' : 'Invite'"
          @click="navTo('NewOnboardingInviteMembers')"
        >
          <p>Add someone to your Cloaked plan</p>
        </UiTile>
        <UiTile
          completed
          icon="monitoring"
          class="ui-tile"
          statusText="Completed"
        >
          <p>Remove sensitive info from the web</p>
        </UiTile>
        <UiTile
          :completed="phoneAndEmailCompleted"
          :statusText="
            phoneAndEmailCompleted ? 'Completed' : 'Get started (1min)'
          "
          icon="identity"
          class="ui-tile"
          @click="navTo('NewOnboardingPhoneEmail')"
        >
          <p>Hide your email & phone number</p>
        </UiTile>
        <UiTile
          v-if="dataBreachesFlowEnabled"
          :completed="dataBreachesCompleted"
          :statusText="
            dataBreachesCompleted ? 'Completed' : 'Get started (1min)'
          "
          icon="breaches"
          class="ui-tile"
          @click="navTo('NewOnboardingBreaches')"
        >
          <p>Find your exposed accounts</p>
        </UiTile>
        <UiTile
          :completed="passwordCompleted"
          :statusText="passwordCompleted ? 'Completed' : 'Get started (1min)'"
          icon="passwords"
          class="ui-tile"
          @click="navTo('NewOnboardingPasswords')"
        >
          <p>Secure & manage passwords</p>
        </UiTile>
      </div>
    </div>
    <UiButton
      class="button"
      :gradient="allFlowsCompleted"
      @click="navToExitScreen"
    >
      {{ allFlowsCompleted ? "Finish" : "I'll do this later" }}
      <inlineSvg
        v-if="allFlowsCompleted"
        name="arrow-right"
      />
    </UiButton>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.tile-block {
  margin-top: 64px;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 700px;
}

.button {
  margin-top: 74px;
}
</style>
