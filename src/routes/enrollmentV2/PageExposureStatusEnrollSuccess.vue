<script setup>
import { useRouter } from "vue-router";
import EnrollmentAppCallGuard from "@/features/enrollment/EnrollmentAppCallGuard.vue";
import EnrollmentAppProgress from "@/features/enrollment/EnrollmentAppProgress.vue";
import UserService from "@/api/actions/user-service";
import { DOWNLOAD_APP_URL } from "@/scripts/constants.ts";
import { HAS_EXITED_DELETE_FLOW } from "@/scripts/userFlags.ts";
import { posthogCapture } from "@/scripts/posthog";
import { useDisplay } from "@/composables/useDisplay";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";

const router = useRouter();

const exitEnrollmentFlow = async () => {
  await UserService.setFlag({
    name: HAS_EXITED_DELETE_FLOW,
    value: true,
  });

  return router.push({ name: "ExposureStatusBrokers" });
};

const { isMobile } = useDisplay();

const onSeeResults = () => {
  if (isMobile.value) {
    window.open(DOWNLOAD_APP_URL, "_blank");
  }

  posthogCapture("user_clicked_see_complete_results");
  exitEnrollmentFlow();
};

const onDownloadApp = () => {
  window.open(DOWNLOAD_APP_URL, "_blank");
  posthogCapture("user_clicked_download_app_button");
  exitEnrollmentFlow();
};

const onSkipDownload = () => {
  posthogCapture("user_clicked_skip_download_button");
  exitEnrollmentFlow();
};

const { featureFlag } = usePostHogFeatureFlag("download-app-experiment");
</script>

<template>
  <EnrollmentAppProgress
    v-if="featureFlag?.startsWith('enrollment-progress')"
    @see-results="onSeeResults"
  />
  <EnrollmentAppCallGuard
    v-else
    @download="onDownloadApp"
    @skip="onSkipDownload"
  />
</template>
