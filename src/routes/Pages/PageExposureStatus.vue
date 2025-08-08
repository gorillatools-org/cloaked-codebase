<script setup>
import { ref, onMounted } from "vue";
import ExposureStatusRecords from "@/features/ExposureStatus/ExposureStatusRecords.vue";
import IdentityTheftProtectionBlock from "@/features/IdentityTheftProtection/IdentityTheftProtectionBlock.vue";
import DownloadAppBlock from "@/features/DownloadApp/DownloadAppBlock.vue";
import ExposureStatusFAQ from "@/features/ExposureStatus/ExposureStatusFAQ.vue";
import ExposureStatusBrokerList from "@/features/ExposureStatus/ExposureStatusBrokerList.vue";
import ExposureStatusSplash from "@/features/ExposureStatus/ExposureStatusSplash.vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import ExposureStatusGraph from "@/features/ExposureStatus/ExposureStatusGraph.vue";
import EmailVerificationBlock from "@/features/emailVerification/EmailVerificationBlock.vue";
import SingleCloakedPhoneWaitlist from "@/features/SingleCloakedPhone/SingleCloakedPhoneWaitlist.vue";
import { isMobileDevice } from "@/scripts/regex";

const rawGraphData = ref(null);
const hideGraph = ref(false);
const isLoading = ref(true);
const isEnrolled = ref(false);

async function loadEnrolledData() {
  try {
    const removalLogPromise = DataDeleteService.getRemovalLog().catch(
      () => null
    );
    const graphDataPromise = DataDeleteService.getGraphData().catch(() => null);

    const [, graphResponse] = await Promise.all([
      removalLogPromise,
      graphDataPromise,
    ]);

    if (graphResponse) {
      rawGraphData.value = graphResponse.data;
      if (
        !graphResponse.data?.graph_data ||
        !graphResponse.data?.graph_data?.length
      ) {
        hideGraph.value = true;
      }
    } else {
      hideGraph.value = true;
    }
  } catch (error) {
    console.error("Error loading enrolled data:", error);
    hideGraph.value = true;
  }
}

onMounted(async () => {
  isLoading.value = true;

  try {
    const response = await DataDeleteService.getEnrollmentData();

    if (response) {
      isEnrolled.value = true;
      await loadEnrolledData();
    }
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div
    class="page-exposure-status"
    :class="{ 'page-exposure-status--loading': isLoading }"
  >
    <div
      class="page-exposure-status__content"
      :class="{
        'page-exposure-status__content--full-width': isLoading || !isEnrolled,
      }"
    >
      <ExposureStatusBrokerList v-if="isEnrolled && !isMobileDevice" />
      <ExposureStatusSplash
        :isLoading="isLoading"
        :isEnrolled="isEnrolled"
      />
    </div>

    <div
      class="page-exposure-status__aside"
      :class="{
        'page-exposure-status__aside--hidden': isLoading || !isEnrolled,
      }"
    >
      <ExposureStatusRecords class="page-exposure-status__aside-item" />
      <DownloadAppBlock
        v-if="isMobileDevice"
        class="page-exposure-status__aside-item"
      />
      <ExposureStatusGraph
        v-if="!hideGraph"
        class="page-exposure-status__aside-item"
        :rawGraphData="rawGraphData"
      />
      <EmailVerificationBlock class="page-exposure-status__aside-item" />
      <IdentityTheftProtectionBlock class="page-exposure-status__aside-item" />
      <SingleCloakedPhoneWaitlist class="page-exposure-status__aside-item" />
      <ExposureStatusFAQ class="page-exposure-status__aside-item" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-exposure-status {
  display: flex;
  height: 100%;
  padding: 0 8px 8px 8px;
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
    padding: 0 24px 24px 24px;
    overflow-y: auto;
    @include custom-scroll-bar;
    position: relative;
    z-index: 1;
    width: 100%;

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
      margin-right: -414px;

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
      transform 0.5s ease;

    @media (max-width: 1023px) {
      transition: none;
    }

    @media (min-width: 1024px) {
      width: 406px;
      padding: 24px;
    }

    &--hidden {
      opacity: 0;

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
