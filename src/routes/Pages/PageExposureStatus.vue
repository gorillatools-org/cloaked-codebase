<script setup>
import { ref, onMounted, toValue, computed, watch, onUnmounted } from "vue";
import ExposureStatusRecords from "@/features/ExposureStatus/ExposureStatusRecords.vue";
import IdentityTheftProtectionBlock from "@/features/IdentityTheftProtection/IdentityTheftProtectionBlock.vue";
import DownloadAppBlock from "@/features/DownloadApp/DownloadAppBlock.vue";
import ExposureStatusFAQ from "@/features/ExposureStatus/ExposureStatusFAQ.vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import ExposureStatusGraph from "@/features/ExposureStatus/ExposureStatusGraph.vue";
import EmailVerificationBlock from "@/features/emailVerification/EmailVerificationBlock.vue";
import { useDisplay } from "@/composables/useDisplay";
import { useRouter, useRoute } from "vue-router";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog.js";

const router = useRouter();
const route = useRoute();

const rawGraphData = computed(
  () => store.getters["dataDelete/getGraphData"] || {}
);
const hideGraph = ref(false);
const isLoading = ref(true);

const { isMobile } = useDisplay();

const enrollmentPollingInterval = ref(null);
const enrollmentTimeoutSet = ref(false);
const enrollmentTimeouts = ref([]);

async function fetchEnrolledData() {
  const removalLogPromise = DataDeleteService.getRemovalLog().catch(() => null);
  const graphDataPromise = DataDeleteService.getGraphData().catch(() => null);
  const automationResultsPromise =
    DataDeleteService.getAutomationResults().catch(() => null);

  const [removalLogResponse, graphResponse, automationResults] =
    await Promise.all([
      removalLogPromise,
      graphDataPromise,
      automationResultsPromise,
    ]);
  return [removalLogResponse, graphResponse, automationResults];
}

async function loadEnrolledData() {
  const [removalLogResponse, graphResponse] = await fetchEnrolledData();

  if (!removalLogResponse?.data || !graphResponse?.data) {
    return setEnrolledDataOnInterval();
  }

  return setEnrolledData(removalLogResponse, graphResponse);
}

async function setEnrolledDataOnInterval() {
  if (enrollmentPollingInterval.value) {
    clearInterval(enrollmentPollingInterval.value);
  }
  const [removalLogResponse, graphResponse] = await fetchEnrolledData();
  if (!removalLogResponse?.data || !graphResponse?.data) {
    enrollmentPollingInterval.value = setInterval(
      () => setEnrolledDataOnInterval(removalLogResponse, graphResponse, true),
      1000
    );
  } else {
    setEnrolledData(removalLogResponse, graphResponse);
    await DataDeleteService.getEnrollmentData();
    clearInterval(enrollmentPollingInterval.value);
    // NOTE: clear quick interval, then fetch data again in 3, 6, and 10 seconds

    if (!enrollmentTimeoutSet.value) {
      enrollmentTimeoutSet.value = true;
      const t1 = setTimeout(() => {
        loadEnrolledData();
      }, 3000);
      const t2 = setTimeout(() => {
        loadEnrolledData();
      }, 6000);
      const t3 = setTimeout(() => {
        loadEnrolledData();
      }, 10000);
      enrollmentTimeouts.value.push(t1, t2, t3);
    }
  }
}

async function setEnrolledData(removalLogResponse, graphResponse) {
  if (graphResponse) {
    const hasGraph =
      Array.isArray(graphResponse.data?.graph_data) &&
      graphResponse.data.graph_data.length > 0;
    hideGraph.value = !hasGraph;
  } else {
    hideGraph.value = true;
  }
}

const isEnrolled = computed(() => {
  return store.getters["dataDelete/hasRemovalEnrollment"];
});

onMounted(() => posthogCapture("user_viewed_exposure_status_page"));

watch(
  () => toValue(router.currentRoute).path,
  async () => {
    isLoading.value = true;
    try {
      const response = await DataDeleteService.getEnrollmentData();
      if (response) {
        await loadEnrolledData();
      }
    } finally {
      isLoading.value = false;
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (enrollmentPollingInterval.value) {
    clearInterval(enrollmentPollingInterval.value);
  }
  if (enrollmentTimeouts.value?.length) {
    enrollmentTimeouts.value.forEach((id) => clearTimeout(id));
    enrollmentTimeouts.value = [];
  }
  enrollmentTimeoutSet.value = false;
});

const unwatch = watch(
  () => [isLoading.value],
  ([isLoadingPage]) => {
    if (!isLoadingPage && !isEnrolled.value) {
      router.push({ name: "ExposureStatusEnrollExposures" });
      unwatch();
    }
  }
);

const hasBrokers = computed(() => {
  return store.getters["dataDelete/removalLogData"]?.brokerList?.length > 0;
});
</script>

<template>
  <div
    class="page-exposure-status"
    :class="{ 'page-exposure-status--loading': isLoading || !hasBrokers }"
  >
    <div
      class="page-exposure-status__content"
      :class="{
        'page-exposure-status__content--full-width':
          isLoading || !hasBrokers || !isEnrolled,
      }"
    >
      <router-view
        :is-enrolled="isEnrolled"
        :is-loading="isLoading || !hasBrokers"
      />
    </div>

    <div
      class="page-exposure-status__aside"
      :class="{
        'page-exposure-status__aside--hidden':
          isLoading || !hasBrokers || !isEnrolled || route?.meta?.hideAside,
      }"
    >
      <ExposureStatusRecords class="page-exposure-status__aside-item" />
      <DownloadAppBlock
        v-if="isMobile"
        class="page-exposure-status__aside-item"
      />
      <ExposureStatusGraph
        v-if="!hideGraph"
        class="page-exposure-status__aside-item"
        :raw-graph-data="rawGraphData"
      />
      <EmailVerificationBlock class="page-exposure-status__aside-item" />
      <IdentityTheftProtectionBlock class="page-exposure-status__aside-item" />
      <ExposureStatusFAQ class="page-exposure-status__aside-item" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.page-exposure-status {
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;

  @media (min-width: 1024px) {
    padding: 0 8px 8px 0px;
    gap: 8px;
  }

  &--loading {
    @media (max-width: 1023px) {
      .page-exposure-status__content {
        width: 100% !important;
        transition: none;
      }
      .page-exposure-status__aside {
        width: 0 !important;
        padding: 0 !important;
        transition: none;
      }
    }
  }

  &__content {
    flex: 1;
    border-radius: 20px;
    padding: 0 24px;
    overflow-y: auto;
    @include custom-scroll-bar;
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;

    transition: all 0.4s ease;

    @media (max-width: 1023px) {
      transition: none;

      &:not(.page-exposure-status__content--full-width) {
        width: 0;
        padding: 0;
        overflow: hidden;
      }
    }

    @media (min-width: 1024px) {
      background-color: $color-primary-5;
    }

    &--loading {
      opacity: 0;
    }

    &--full-width {
      width: 100%;

      @media (max-width: 1023px) {
        margin-right: 0;
        background-color: $color-primary-5;
        transition: none;
      }
    }
  }

  &__aside {
    width: 100%;
    flex-shrink: 0;
    background-color: $color-primary-5;
    border-radius: 20px;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-x: hidden;
    overflow-y: auto;
    @include custom-scroll-bar;
    position: relative;
    z-index: 1;

    transition:
      opacity 0.5s ease,
      transform 0.5s ease,
      width 0.5s ease,
      padding 0.5s ease;

    @media (max-width: 1023px) {
      transition: none;
    }

    @media (min-width: 1024px) {
      width: 406px;
      padding: 24px;
    }

    &--hidden {
      opacity: 0;
      width: 0;
      padding: 0;
      overflow: hidden;

      .page-exposure-status__aside-item {
        opacity: 0;
        transform: translateY(60px);
      }
    }

    &-item {
      min-width: 358px;
      opacity: 1;
      transform: translateY(0);

      @media (max-width: 1023px) {
        min-width: 100%;
        transition: none;
      }

      @media (min-width: 1024px) {
        transition: all 0.4s ease;
      }

      @for $i from 1 through 10 {
        &:nth-child(#{$i}) {
          transition-delay: 0.15s + (0.1s * $i);
        }
      }
    }
  }
}
</style>
