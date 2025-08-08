<script setup>
import HomeRecent from "@/features/home/HomeRecent.vue";
import HomeActions from "@/features/home/HomeActions.vue";
import HomeInbox from "@/features/home/HomeInbox.vue";
import HomeBreaches from "@/features/home/HomeBreaches.vue";
import HomeIdentities from "@/features/home/HomeIdentities.vue";
import HomeQuickLinks from "@/features/home/HomeQuickLinks.vue";
import HomeDataRemoval from "@/features/home/HomeDataRemoval.vue";
import HomeDownloadMobile from "@/features/home/HomeDownloadMobile.vue";
import HomeNewOnboarding from "@/features/home/HomeNewOnboarding.vue";
import HomeBulkPlan from "@/features/home/HomeBulkPlan.vue";
import HomeESim from "@/features/home/HomeESim.vue";
import { onMounted, ref, onBeforeUnmount, computed, onBeforeMount } from "vue";
import store from "@/store";
import {
  COMPLETED_DD_ONBOARDING_PHONE_EMAIL,
  COMPLETED_DD_ONBOARDING_DATA_BREACHES,
  COMPLETED_DD_ONBOARDING_PASSWORD_GENERATOR,
} from "@/scripts/userFlags";
import UserService from "@/api/actions/user-service";
import EsimService from "@/api/actions/esim-service";
import { PH_FEATURE_ENABLE_BREACHES_FLOW_ENABLED } from "@/scripts/posthogEvents";
import router from "@/routes/router";
import { useBasicMode } from "@/composables/useBasicMode";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";
import EmailVerificationBlock from "@/features/emailVerification/EmailVerificationBlock.vue";

const SCREEN_SIZE_MEDIA = 1200;
const currentScreenSize = ref(window.innerWidth);

const isLargeScreen = computed(() => {
  return currentScreenSize.value > SCREEN_SIZE_MEDIA;
});

const { isBasicModeEnabled, isBasicModeAccessible } = useBasicMode();

const basicModeEnabled = computed(() => {
  return isBasicModeAccessible.value && isBasicModeEnabled.value;
});

onBeforeMount(() => {
  if (basicModeEnabled.value) {
    router.push({ name: "SummaryBasicMode" });
  }
});

onMounted(async () => {
  try {
    if (!hasEsimsWithNumbers.value) {
      EsimService.getSims({ number: true });
    }
    await UserService.getNewOnboardingFlags();
  } catch {
    // do nothing
  }
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});

const { freeSpots } = useInvites();

const isPlanOwner = computed(() => {
  return store.getters["settings/getSubscription"]?.owner;
});

const showNewOnboarding = computed(() => {
  return store.state.authentication?.user?.flags
    ?.show_dd_post_payment_onboarding;
});

const ddOnboardingEnabled = computed(() => {
  return store.getters["dataDelete/getDdOnboardingEnabled"];
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

const newOnboardingCompleted = computed(() => {
  return (
    phoneAndEmailCompleted.value &&
    dataBreachesCompleted.value &&
    passwordCompleted.value
  );
});

const showNewOnboardingSection = computed(() => {
  return (
    ddOnboardingEnabled.value &&
    showNewOnboarding.value &&
    !newOnboardingCompleted.value
  );
});

const hasEsimsWithNumbers = computed(() => {
  const simsWithNumbers = store.getters["esim/getEsims"]?.filter(
    (sim) => !!sim?.msisdn
  );

  return !!simsWithNumbers?.length;
});

function onResize() {
  currentScreenSize.value = window.innerWidth;
}
</script>

<template>
  <div class="homescreen-wrapper">
    <div class="homescreen-outer">
      <div class="homescreen-left">
        <HomeESim
          v-if="hasEsimsWithNumbers"
          style="margin-bottom: 48px"
        />
        <HomeDataRemoval style="margin-bottom: 48px" />
        <HomeNewOnboarding
          v-if="showNewOnboardingSection"
          style="margin-bottom: 48px"
        />
        <HomeBulkPlan
          v-if="isPlanOwner && freeSpots > 0"
          style="margin-bottom: 48px"
        />
        <EmailVerificationBlock
          v-show="!isLargeScreen"
          style="margin-bottom: 48px"
        />
        <HomeActions style="margin-bottom: 48px" />
        <HomeRecent style="margin-bottom: 48px" />
        <HomeInbox
          v-show="!isLargeScreen"
          style="margin-bottom: 48px"
        />
        <HomeDownloadMobile
          v-show="!isLargeScreen"
          style="margin-bottom: 48px"
        />
        <HomeBreaches style="margin-bottom: 48px" />
        <HomeIdentities style="margin-bottom: 48px" />
      </div>
      <div class="homescreen-right">
        <HomeInbox v-show="isLargeScreen" />
        <EmailVerificationBlock v-show="isLargeScreen" />
        <HomeDownloadMobile v-show="isLargeScreen" />
        <HomeQuickLinks />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.homescreen-wrapper {
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  .homescreen-outer {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 50px;
    max-width: 1000px;

    .homescreen-left {
      flex: 2;
    }

    .homescreen-right {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 309px;
    }

    @media (width <= 1200px) {
      flex-direction: column;
      gap: 0;

      .homescreen-left {
        flex: 1;
        border: none;
      }

      .homescreen-right {
        flex: 1;
        width: 100%;
      }
    }
  }
}
</style>
