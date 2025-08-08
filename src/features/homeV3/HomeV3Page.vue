<script setup>
import { onMounted, ref, computed } from "vue";
import HomeV3ExposureSummary from "@/features/homeV3/exposure-summary/HomeV3ExposureSummary.vue";
import WhatToExpectCard from "@/features/homeV3/WhatToExpectCard.vue";
import BulkPlansHomeCard from "@/features/homeV3/BulkPlansHomeCard.vue";
import TimelineCard from "@/features/homeV3/timeline/TimelineCard.vue";
import IdProtectionCard from "@/features/homeV3/id-protection/IdProtectionCard.vue";
import store from "@/store";
import DataDeleteService from "@/api/actions/data-delete-service";
import InlineSvg from "@/features/InlineSvg.vue";
import { useDataDeleteOverlay } from "@/routes/DataDeletion/composables/useDataDeleteOverlay";
import { useBasicMode } from "@/composables/useBasicMode.js";
import router from "@/routes/router";
import { isMobileDevice } from "@/scripts/regex";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";
import { HAS_CLICKED_BASIC_MODE_DOWNLOAD_APP } from "@/scripts/userFlags.js";
import UserService from "@/api/actions/user-service";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";
import BaseText from "@/library/BaseText.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseButton from "@/library/BaseButton.vue";
import callGuardActiveImage from "@/assets/images/call-guard-active.png";
import { useFeatures } from "@/composables/useFeatures.js";

const { hasExposureStatus } = useFeatures();

const { isBasicModeAccessible, isBasicModeEnabled } = useBasicMode();

const { openDataDeleteOverlay } = useDataDeleteOverlay();

const loaded = ref(false);

const basicModeEnabled = computed(() => {
  return isBasicModeAccessible.value && isBasicModeEnabled.value;
});

const { freeSpots } = useInvites();

const isPlanOwner = computed(() => {
  return store.getters["settings/getSubscription"].owner;
});

const downloadCallGuardActive = computed(() => {
  return store.state.authentication?.user?.flags?.["spam-blocking"] === true;
});

const downloadCallGuardActiveToggle = ref(downloadCallGuardActive.value);

function toggleDownloadCallGuardActive() {
  downloadCallGuardActiveToggle.value = !downloadCallGuardActiveToggle.value;
}

onMounted(() => {
  pollBasicModeSummary();

  if (hasExposureStatus.value) {
    router.push({ path: "/exposure-status" });
  }

  DataDeleteService.getBasicModeSummary()
    .then(() => {
      loaded.value = true;
    })
    .catch(() => {
      loaded.value = true;
    });

  if (!basicModeEnabled.value) {
    router.push({ path: "/home" });
  }
});

const summary = computed(() => {
  return store.getters["dataDelete/getBasicModeSummary"];
});

const hasSummaryData = computed(() => {
  return !!summary.value && Object.keys(summary.value).length > 0;
});

const showMobileCard = computed(() => {
  return isMobileDevice && !hasClickedMobileCard.value;
});

const hasClickedMobileCard = computed(() => {
  return store.getters.getFlag(HAS_CLICKED_BASIC_MODE_DOWNLOAD_APP);
});

const username = computed(() => store.getters["authentication/getUsername"]);

let pollingInterval;
function pollBasicModeSummary() {
  pollingInterval = setInterval(() => {
    if (
      !summary.value?.summary?.exposures_removed ||
      summary.value?.summary?.exposures_removed === 0
    ) {
      return DataDeleteService.getBasicModeSummary();
    } else {
      return clearInterval(pollingInterval);
    }
  }, 3000);
}

function downloadApp() {
  window.open(DOWNLOAD_APP_URL, "_blank");
  UserService.setFlag({
    name: HAS_CLICKED_BASIC_MODE_DOWNLOAD_APP,
    value: true,
  });
}
</script>

<template>
  <div
    v-if="!hasSummaryData"
    class="no-summary-wrapper"
  >
    <InlineSvg
      name="blob-blue-green-yellow"
      class="circles-icon"
    />
    <div
      v-if="loaded"
      class="no-summary-content"
    >
      <h1 class="no-summary-header">Exposure Removal Not Yet Started</h1>
      <p class="no-summary-subheader">
        Your exposed data is not ready for removal yet. Complete enrollment
        today to get your first results in under 48 hours.
      </p>
      <BaseButton
        size="lg"
        variant="primary"
        icon="chevron-right"
        class="gradient-button"
        @click="openDataDeleteOverlay"
      >
        Complete enrollment form
      </BaseButton>
    </div>
  </div>
  <div
    v-else
    class="homescreen-outer"
  >
    <div
      v-if="downloadCallGuardActiveToggle && isMobileDevice"
      class="download-call-guard-active"
    >
      <BaseText
        class="download-call-guard-active-title"
        variant="headline-2-semibold"
        as="h2"
      >
        Download Cloaked to prevent spam forever
      </BaseText>

      <img
        :src="callGuardActiveImage"
        alt="Call Guard Active"
        class="download-call-guard-active-image"
      />

      <BaseSheet class="download-call-guard-active-sheet">
        <div class="download-call-guard-active-sheet-content">
          <BaseText
            variant="headline-6-bold"
            as="h6"
          >
            Built-in Spam Protection
          </BaseText>
          <BaseText
            variant="body-3-regular"
            as="p"
          >
            Cloaked will engage unknown callers before they reach your phone to
            protect your time and safety.
          </BaseText>
          <BaseText
            variant="body-3-regular"
            as="p"
          >
            Your account has been set up. Make sure to Sign In using
            <strong>{{ username }}</strong>
            as your username to access your subscription.
          </BaseText>
          <div class="download-call-guard-active-sheet-buttons">
            <BaseButton
              variant="primary"
              size="lg"
              fullWidth
              icon="download"
              class="download-call-guard-active-sheet-button"
              backgroundColor="purple-gradient"
              @click="downloadApp"
            >
              Download Cloaked
            </BaseButton>

            <BaseButton
              variant="text"
              fullWidth
              class="download-call-guard-active-sheet-button"
              @click="toggleDownloadCallGuardActive"
            >
              Not now
            </BaseButton>
          </div>
        </div>
      </BaseSheet>
    </div>

    <div v-else>
      <HomeV3ExposureSummary
        :summary="summary.summary"
        :timeline="summary.timeline"
        class="homescreen-exposure-summary"
      />

      <div class="homescreen-bottom">
        <TimelineCard :timelineData="summary.timeline" />
        <div class="homescreen-right">
          <WhatToExpectCard :statistics="summary.statistics" />
          <IdProtectionCard v-if="!isMobileDevice" />
          <BulkPlansHomeCard
            v-if="freeSpots > 0 && isPlanOwner && !isMobileDevice"
          />
        </div>

        <div
          v-if="showMobileCard"
          class="mobile-card"
        >
          <h3 class="title">For you</h3>
          <div class="mobile-card-box">
            <div class="logo-box">
              <InlineSvg name="cloaked-logo-orange" />
            </div>
            <h4 class="title">Download Cloaked Mobile</h4>
            <p>
              Enjoy push notifications about your data removal, access advanced
              mode, and instant access to new features.
            </p>
            <p>
              Your account has been set up. Make sure to Sign In using
              <strong>{{ username }}</strong>
              as your username to access your subscription.
            </p>
            <BaseButton
              variant="primary"
              size="lg"
              icon="arrow-ne"
              @click="downloadApp"
            >
              Open App Store
            </BaseButton>
          </div>

          <BulkPlansHomeCard
            v-if="freeSpots > 0 && isPlanOwner && isMobileDevice"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes spin-circles {
  to {
    transform: rotate(360deg);
  }
}

.title {
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.mobile-card {
  color: $color-primary-100;
  display: flex;
  flex-direction: column;
  gap: 24px;

  .mobile-card-box {
    margin-top: -16px;
    padding: 24px;
    border-radius: 24px;
    border: 1px solid $color-primary-10;
    background: $color-primary-1;
    box-shadow: 0 16px 20px 0 rgba($black, 0.05);
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .logo-box {
      border-radius: 15px;
      border: 1px solid rgba($black, 0.1);
      background: rgba($black, 0.2);
      height: 56px;
      width: 56px;
      align-items: center;
      justify-content: center;
      display: flex;

      > svg {
        height: 40px;
        width: 40px;
      }

      @at-root .theme-dark & {
        border: 1px solid rgba($white, 0.1);
        background: rgba($white, 0.3);
      }
    }

    .button {
      margin-top: 16px;
    }
  }
}

.no-summary-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 20px;
  align-items: center;
  flex-direction: column;
  color: $color-primary-100;
  padding: 20px;

  .circles-icon {
    width: 230px;
    height: 230px;
    animation: spin-circles 5s linear infinite;
  }

  .no-summary-content {
    width: 100%;
    max-width: 325px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .no-summary-header {
      font-size: 32px;
      font-style: normal;
      font-weight: 600;
      line-height: 40px; /* 125% */
      text-align: center;
    }

    .no-summary-subheader {
      font-size: 15px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      margin-bottom: 24px;
      text-align: center;
    }

    .gradient-button {
      background: $gradient-blue;
      color: $black;
      outline: none;
    }
  }
}

.homescreen-outer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 33px;
  padding: 40px 24px;

  .homescreen-bottom {
    display: flex;
    flex-flow: column-reverse wrap;
    gap: 24px;
    width: 100%;
    justify-content: center;
    max-width: 788px;

    @media all and (min-width: $screen-xl) {
      flex-direction: row;
      gap: 36px;
    }
  }

  .homescreen-right {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;

    @media all and (min-width: $screen-xl) {
      max-width: 366px;
    }
  }
}

.homescreen-exposure-summary {
  margin-bottom: 16px;
}

.download-call-guard-active {
  &-title {
    text-align: center;
    margin-bottom: 24px;
  }

  &-image {
    width: 100%;
    max-width: 325px;
    height: auto;
    margin: 0 auto;
    display: block;
  }

  &-sheet {
    background-color: $color-primary-5;
    padding-top: 24px;
    margin-top: -10px;
    position: relative;
    z-index: 1;

    &-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      text-align: center;
      margin-top: 16px;
    }

    &-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>
