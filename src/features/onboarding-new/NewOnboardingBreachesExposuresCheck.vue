<script setup>
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import UiButtonRow from "@/features/onboarding-new/UiButtonRow.vue";
import UiListRow from "@/features/onboarding-new/UiListRow.vue";
import UiListRowWrapper from "@/features/onboarding-new/UiListRowWrapper.vue";
import BreachesService from "@/api/actions/breaches-service.js";
import store from "@/store";
import inlineSvg from "@/features/InlineSvg.vue";
import { useToast } from "@/composables/useToast.js";
import router from "@/routes/router";
import { posthogCapture } from "@/scripts/posthog.js";
import UserService from "@/api/actions/user-service";
import { COMPLETED_DD_ONBOARDING_DATA_BREACHES } from "@/scripts/userFlags";

import { onMounted, computed, reactive, nextTick, watch } from "vue";
import {
  PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_BREACH_ACCOUNT,
  PH_EVENT_ONBOARDING_FLOW_BREACHES_3RD_SCREEN,
  PH_EVENT_ONBOARDING_FLOW_BREACHES_ALL_COMPLETE,
  PH_EVENT_ONBOARDING_FLOW_BREACHES_ALL_COMPLETE_CONTINUE,
  PH_EVENT_ONBOARDING_FLOW_BREACHES_ALL_DO_MORE_LATER,
  PH_EVENT_ONBOARDING_FLOW_BREACHES_NONE_FOUND,
  PH_EVENT_ONBOARDING_FLOW_BREACHES_NONE_FOUND_CONTINUE,
  PH_EVENT_ONBOARDING_FLOW_BREACHES_NONE_FOUND_DO_MORE_LATER,
} from "@/scripts/posthogEvents";

const emit = defineEmits(["setBreach", "next"]);

const toast = useToast();
const emailbreaches = computed(() => {
  return store.getters["breaches/getEmailBreaches"].filter(
    (breach) => !!breach.domain
  );
});

const state = reactive({
  loading: !emailbreaches.value?.length,
  breaches: [],
  websites: {},
});

onMounted(() => {
  if (!emailbreaches.value?.length) {
    fetchBreaches();
  }

  posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_3RD_SCREEN);
});

const primaryEmailObject = computed(() => {
  const allEmails = store.getters["settings/getPersonalEmails"];
  return allEmails.find((email) => email.primary);
});

const allBreachesCompleted = computed(() => {
  return (
    emailbreaches.value?.length &&
    emailbreaches.value?.every((breach) => !!findIdentity(breach.name))
  );
});

function fetchBreaches() {
  setTimeout(() => {
    BreachesService.getBreachesForPrimaryEmailPhone()
      .then(() => {
        state.loading = false;
        return;
      })
      .catch(() => {
        toast.error("Something went wrong, please try reloading the page.");
      });
  }, 3000);
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString();
}

function onClickBreach(breach) {
  if (findIdentity(breach.name)) {
    return;
  }
  emit("next");
  emit("setBreach", breach);
  const exposed_account = breach?.name?.length ? breach.name : breach.domain;
  posthogCapture(PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_BREACH_ACCOUNT, {
    exposed_account,
  });
}

function findIdentity(breachName) {
  return store.getters?.allCloaks?.find((i) => i.nickname === breachName);
}
function navToExitScreen() {
  router.push({ name: "NewOnboardingExit" });
}

function navToGetStarted() {
  router.push({ name: "NewOnboardingGetStarted" });
}
function allCompleteContinueClicked() {
  posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_ALL_COMPLETE_CONTINUE);
  navToGetStarted();
}

function allCompleteDoMoreLaterClicked() {
  posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_ALL_DO_MORE_LATER);
  navToExitScreen();
}
function noneFoundDoMoreLaterClicked() {
  posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_NONE_FOUND_DO_MORE_LATER);
  navToExitScreen();
}

function noneFoundContinueClicked() {
  posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_NONE_FOUND_CONTINUE);
  navToGetStarted();
}

watch(allBreachesCompleted, (completed) => {
  if (completed) {
    posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_ALL_COMPLETE);
  }
});

watch(
  () => state.loading,
  (value) => {
    if (!value) {
      nextTick(() => {
        if (emailbreaches.value?.length === 0) {
          posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_NONE_FOUND);
          UserService.setNewOnboardingFlag(
            COMPLETED_DD_ONBOARDING_DATA_BREACHES,
            true
          );
        }
      });
    }
  }
);
</script>
<template>
  <UiPageWrapper
    v-if="state.loading"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_BREACHES_3RD_SCREEN"
  >
    <UiHeader>
      <h2>Checking for exposures</h2>
      <p>
        We're checking your email address
        <b>{{ primaryEmailObject?.email }}</b>
        for exposures. This may take a moment.
      </p>
    </UiHeader>
    <div class="image-wrapper">
      <img
        src="@/assets/images/onboarding-new/search.png"
        alt="search icon"
        width="517"
      />
    </div>
    <div class="spinner-wrapper">
      <inlineSvg name="spinner" />
    </div>
  </UiPageWrapper>

  <UiPageWrapper
    v-else-if="allBreachesCompleted"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_BREACHES_ALL_COMPLETE"
  >
    <UiHeader>
      <h2>You've taken care of all exposed data</h2>
      <p>
        Well done! You've created replacement info for all of your exposed
        accounts.
      </p>
    </UiHeader>
    <UiListRowWrapper>
      <UiListRow
        v-for="breach in emailbreaches"
        :key="breach.name"
        :icon="breach.logo_url"
        :title="breach.name"
        :subtitle="`Leaked on ${formatDate(breach.breach_date)}`"
        :completed="!!findIdentity(breach.name)"
        @click="onClickBreach(breach)"
      />
    </UiListRowWrapper>

    <UiButtonRow class="button-row-overlay">
      <UiButton
        width="217px"
        @click="allCompleteDoMoreLaterClicked"
      >
        I'll do more later
      </UiButton>
      <UiButton
        width="217px"
        gradient
        imgName="arrow-right"
        @click="allCompleteContinueClicked"
      >
        Continue setup
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>

  <UiPageWrapper
    v-else-if="emailbreaches?.length"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_BREACHES_3RD_SCREEN"
  >
    <UiHeader>
      <h2>
        We found {{ emailbreaches?.length }} exposed
        {{ emailbreaches?.length === 1 ? "account" : "accounts" }}
      </h2>
      <p>
        Choose one of these sites or services to replace personal info. You can
        access this later from the dashboard.
      </p>
    </UiHeader>
    <UiListRowWrapper>
      <UiListRow
        v-for="breach in emailbreaches"
        :key="breach.name"
        :icon="breach.logo_url"
        :title="breach.name"
        :subtitle="`Leaked on ${formatDate(breach.breach_date)}`"
        :completed="!!findIdentity(breach.name)"
        @click="onClickBreach(breach)"
      />
    </UiListRowWrapper>
  </UiPageWrapper>

  <UiPageWrapper
    v-else
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_BREACHES_NONE_FOUND"
  >
    <UiHeader>
      <h2>We didn't find any exposures</h2>
      <p>Great news! We couldn't find any exposures linked to your data.</p>
    </UiHeader>
    <div class="image-wrapper">
      <img
        src="@/assets/images/onboarding-new/completed.png"
        alt="completed icon"
        width="517"
      />
    </div>
    <UiButtonRow>
      <UiButton
        width="217px"
        gradient
        imgName="arrow-right"
        @click="noneFoundContinueClicked"
      >
        Continue setup
      </UiButton>
      <UiButton
        width="217px"
        @click="noneFoundDoMoreLaterClicked"
      >
        I'll do more later
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
}

.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.spinner-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  svg {
    height: 48px;
    width: 48px;
    color: $color-primary-100;
  }
}

.button-row-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  padding-top: 100px;
  padding-bottom: 5%;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(
    to bottom,
    rgba($color-base-white-100-light, 0),
    rgba($color-base-white-100-light, 1),
    rgba($color-base-white-100-light, 1)
  );

  @at-root .theme-dark & {
    background: linear-gradient(
      to bottom,
      rgba($color-base-white-100-dark, 0),
      rgba($color-base-white-100-dark, 1),
      rgba($color-base-white-100-dark, 1)
    );
  }
}
</style>
