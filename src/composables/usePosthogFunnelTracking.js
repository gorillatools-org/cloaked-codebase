import { onBeforeMount, onBeforeUnmount } from "vue";
import { getPosthog } from "@/scripts/posthog";
import { useRoute } from "vue-router";

export const usePostHogFunnelTracking = () => {
  const route = useRoute();

  onBeforeMount(() => {
    getPosthog().then((postHog) => {
      postHog?.identify(route?.query?.vid);
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
