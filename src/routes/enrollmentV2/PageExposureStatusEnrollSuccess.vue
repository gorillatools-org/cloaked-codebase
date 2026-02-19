<script setup>
import { useRouter } from "vue-router";
import EnrollmentAppProgress from "@/features/enrollment/EnrollmentAppProgress.vue";
import UserService from "@/api/actions/user-service";
import { HAS_EXITED_DELETE_FLOW } from "@/scripts/userFlags.ts";
import { posthogCapture } from "@/scripts/posthog";
import { useDisplay } from "@/composables/useDisplay";
import { useDeepLink } from "@/composables/useDeeplink";
import store from "@/store/index.js";
import { computed } from "vue";
const router = useRouter();

const exitEnrollmentFlow = async () => {
  await UserService.setFlag({
    name: HAS_EXITED_DELETE_FLOW,
    value: true,
  });

  return router.push({ name: "ExposureStatusBrokers" });
};

const { openDownloadAppDeepLink } = useDeepLink();
const username = computed(() => store.getters["authentication/getUsername"]);
const { isMobile } = useDisplay();

const onSeeResults = async () => {
  posthogCapture("user_clicked_see_complete_results");
  await exitEnrollmentFlow();

  if (isMobile.value) {
    await openDownloadAppDeepLink(username.value);
  }
};
</script>

<template>
  <EnrollmentAppProgress @see-results="onSeeResults" />
</template>
