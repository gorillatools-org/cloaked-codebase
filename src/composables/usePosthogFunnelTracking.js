import { onBeforeMount, onBeforeUnmount } from "vue";
import { getPosthog } from "@/scripts/posthog";

export const usePostHogFunnelTracking = () => {
  onBeforeMount(() => {
    getPosthog().then((postHog) => {
      postHog?.startSessionRecording();
    });
  });

  onBeforeUnmount(() => {
    getPosthog().then((postHog) => {
      if (postHog?.sessionRecordingStarted()) {
        postHog?.stopSessionRecording();
      }
    });
  });
};
