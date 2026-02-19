<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import type {
  DownloadAppBlock,
  DownloadAppFeatureFlag,
} from "@/features/checkout/downloadAppTypes.ts";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import CheckoutDownloadApp from "@/features/checkout/download-app/CheckoutDownloadApp.vue";
import { posthogCapture } from "@/scripts/posthog";
import { useDeepLink } from "@/composables/useDeeplink.ts";
import store from "@/store";
import { useRouter } from "vue-router";
import { useDisplay } from "@/composables/useDisplay";
import UserService from "@/api/actions/user-service";
import { HAS_EXITED_DELETE_FLOW } from "@/scripts/userFlags.ts";

const blocks = ref<DownloadAppBlock[]>([]);

onBeforeMount(() => posthogCapture("user_viewed_post_enrollment_download_app"));

onBeforeMount(async () => {
  const { payload }: DownloadAppFeatureFlag = await fetchFeatureFlag(
    "post_enrollment_download_app"
  );

  blocks.value = payload;
});

const router = useRouter();
const { isMobile } = useDisplay();

const exitEnrollmentFlow = async () => {
  await UserService.setFlag({
    name: HAS_EXITED_DELETE_FLOW,
    value: true,
  });

  return router.push({ name: "ExposureStatusBrokers" });
};

const { openDownloadAppDeepLink } = useDeepLink();
const username = computed(() => store.getters["authentication/getUsername"]);

const onDownloadApp = async () => {
  posthogCapture("user_clicked_post_enrollment_download_app_button");
  await exitEnrollmentFlow();

  if (isMobile.value) {
    await openDownloadAppDeepLink(username.value);
  }
};
</script>

<template>
  <div class="enrollment-download">
    <CheckoutDownloadApp
      v-if="blocks.length > 0"
      :blocks="blocks"
      @download="onDownloadApp"
    />
  </div>
</template>

<style scoped lang="scss">
:global(
  .enrollment-v2-enroll:has(.enrollment-download) .enrollment-v2-enroll__header
) {
  display: none;
}

:global(
  .enrollment-v2-enroll:has(.enrollment-download) .enrollment-v2-enroll__content
) {
  padding-top: 0;
  padding-bottom: 0;
}

.enrollment-download {
  width: 100%;
  max-width: 540px;
}
</style>
