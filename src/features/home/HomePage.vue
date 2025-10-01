<script setup>
import HomeRecent from "@/features/home/HomeRecent.vue";
import HomeActions from "@/features/home/HomeActions.vue";
import HomeInbox from "@/features/home/HomeInbox.vue";
import HomeBreaches from "@/features/home/HomeBreaches.vue";
import HomeIdentities from "@/features/home/HomeIdentities.vue";
import HomeQuickLinks from "@/features/home/HomeQuickLinks.vue";
import HomeDataRemoval from "@/features/home/HomeDataRemoval.vue";
import HomeDownloadMobile from "@/features/home/HomeDownloadMobile.vue";
import HomeBulkPlan from "@/features/home/HomeBulkPlan.vue";
import HomeESim from "@/features/home/HomeESim.vue";
import { onMounted, computed, onBeforeMount } from "vue";
import store from "@/store";
import UserService from "@/api/actions/user-service";
import EsimService from "@/api/actions/esim-service";
import router from "@/routes/router";
import { useBasicMode } from "@/composables/useBasicMode";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";
import EmailVerificationBlock from "@/features/emailVerification/EmailVerificationBlock.vue";
import { useDisplay } from "@/composables/useDisplay";

const { isDesktop } = useDisplay();
const { isBasicModeEnabled } = useBasicMode();

const basicModeEnabled = computed(() => {
  return isBasicModeEnabled.value;
});

onBeforeMount(() => {
  if (basicModeEnabled.value) {
    router.push({ name: "ExposureStatusBrokers" });
  }
});

onMounted(async () => {
  try {
    if (!hasEsimsWithNumbers.value) {
      EsimService.getSims({ number: true });
    }
    await UserService.getFlags();
  } catch {
    // do nothing
  }
});

const { freeSpots } = useInvites();

const isPlanOwner = computed(() => {
  return store.getters["settings/getSubscription"]?.owner;
});

const hasEsimsWithNumbers = computed(() => {
  const simsWithNumbers = store.getters["esim/getEsims"]?.filter(
    (sim) => !!sim?.msisdn
  );

  return !!simsWithNumbers?.length;
});
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
        <HomeBulkPlan
          v-if="isPlanOwner && freeSpots > 0"
          style="margin-bottom: 48px"
        />
        <EmailVerificationBlock
          v-show="!isDesktop"
          style="margin-bottom: 48px"
        />
        <HomeActions style="margin-bottom: 48px" />
        <HomeRecent style="margin-bottom: 48px" />
        <HomeInbox
          v-show="!isDesktop"
          style="margin-bottom: 48px"
        />
        <HomeDownloadMobile
          v-show="!isDesktop"
          style="margin-bottom: 48px"
        />
        <HomeBreaches style="margin-bottom: 48px" />
        <HomeIdentities style="margin-bottom: 48px" />
      </div>
      <div class="homescreen-right">
        <HomeInbox v-show="isDesktop" />
        <EmailVerificationBlock v-show="isDesktop" />
        <HomeDownloadMobile v-show="isDesktop" />
        <HomeQuickLinks />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
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
