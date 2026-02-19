<script setup>
import { useMonitoringAutofill } from "@/features/monitoring/useMonitoringAutofill.js";
import {
  onBeforeMount,
  ref,
  computed,
  onMounted,
  toValue,
  onBeforeUnmount,
} from "vue";
import { HAS_EXITED_DELETE_FLOW } from "@/scripts/userFlags";
import store from "@/store";
import { PH_EVENT_USER_VIEWED_DD_SUBMISSION_FORM } from "@/scripts/posthogEvents.js";
import { useColorScheme } from "@/composables/useColorScheme";
import { posthogCapture } from "@/scripts/posthog.js";
import EnrollmentCardHeader from "@/features/enrollment/EnrollmentCardHeader.vue";
import { getPosthog } from "@/scripts/posthog.js";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { useDisplay } from "@/composables/useDisplay.js";
import { useRouter } from "vue-router";
const { colorScheme } = useColorScheme();

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_DD_SUBMISSION_FORM, {
    theme: colorScheme.value,
  });

  getPosthog()
    .then((posthog) => {
      if (posthog?.sessionRecordingStarted()) {
        posthog?.stopSessionRecording();
      }
      posthog?.startSessionRecording();
    })
    .catch(() => {
      // do nothing, silently handle error
    });
});

onBeforeUnmount(() => {
  getPosthog()
    .then((posthog) => {
      posthog?.stopSessionRecording();
    })
    .catch(() => {
      // do nothing, silently handle error
    });
});

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  isEnrolled: {
    type: Boolean,
    default: false,
  },
});

const autofillData = ref({
  wasAutofilled: false,
});

const {
  combineAutofillData,
  getAutofillDataFromEnrollment,
  getAutofillDataFromSearchResultsV2,
  getAutofillDataFromUserObject,
} = useMonitoringAutofill();

const autofillFormOnce = async () => {
  if (autofillData.value.wasAutofilled) {
    return;
  }

  let newAutofillData = toValue(autofillData);
  const dataFromSearchResults = await getAutofillDataFromSearchResultsV2();
  newAutofillData = await combineAutofillData(
    newAutofillData,
    dataFromSearchResults
  );

  const dataFromUserObject = await getAutofillDataFromUserObject();
  newAutofillData = await combineAutofillData(
    newAutofillData,
    dataFromUserObject
  );

  const dataFromEnrollment = await getAutofillDataFromEnrollment();
  newAutofillData = await combineAutofillData(
    newAutofillData,
    dataFromEnrollment
  );
  autofillData.value = { ...newAutofillData, wasAutofilled: true };
};

onBeforeMount(autofillFormOnce);

const hasExitedDeleteFlow = computed(() => {
  return store.getters.getFlag(HAS_EXITED_DELETE_FLOW);
});

const router = useRouter();

const { isMobile } = useDisplay();

async function exitDeleteFlow() {
  const { payload: downloadPayload } = await fetchFeatureFlag(
    "post_enrollment_download_app"
  );

  if (downloadPayload?.length && isMobile.value) {
    return router.push({ name: "ExposureStatusEnrollDownload" });
  }

  return router.push({ name: "ExposureStatusEnrollSuccess" });
}
</script>

<template>
  <div class="enrollment-v2-enroll">
    <div class="enrollment-v2-enroll__content">
      <EnrollmentCardHeader
        class="enrollment-v2-enroll__header"
        hide-icon
        secure-text="Required: Confirm Data"
        alignment="flex-end"
        header-text="Secure your data"
        subheader-text="Adding this information allows us to locate and secure exposures on data broker websites while protecting it with advanced security measures."
      />
      <router-view
        v-if="!props.isLoading"
        :is-loading="props.isLoading"
        :is-enrolled="props.isEnrolled"
        :has-exited-delete-flow="hasExitedDeleteFlow"
        :autofill-data="autofillData"
        @exit-delete-flow="exitDeleteFlow"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.enrollment-v2-enroll {
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;
  align-items: flex-start;
  justify-content: center;

  &__header {
    max-width: 400px;
    margin: 0 auto;
    padding-right: 2px;

    // More specific targeting with multiple selectors
    :deep(.enrollment-card-header) {
      justify-content: flex-end !important;
      display: flex !important;
    }

    // Target with class combination for higher specificity
    :deep(.enrollment-card-header.enrollment-card-header) {
      justify-content: flex-end !important;
    }

    // Also target any flex container styles
    &.enrollment-v2-enroll__header :deep(.enrollment-card-header) {
      justify-content: flex-end !important;
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 250px;

    @include custom-scroll-bar;
  }

  &__orb {
    transition: all 0.5s ease;
    width: 400px;
    max-width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;

    &--animate {
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.5s ease;
    }
  }
}
</style>
