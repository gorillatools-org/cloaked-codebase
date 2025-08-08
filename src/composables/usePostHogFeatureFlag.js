import { onBeforeMount, ref } from "vue";
import { getPosthog } from "@/scripts/posthog";

export const usePostHogFeatureFlag = (flagName) => {
  const featureFlag = ref(null);
  const featureFlagPayload = ref(null);
  const hasLoadedFeatureFlag = ref(false);

  onBeforeMount(async () => {
    const posthog = await getPosthog();
    posthog?.onFeatureFlags(() => {
      featureFlag.value = posthog?.getFeatureFlag(flagName);
      featureFlagPayload.value = posthog?.getFeatureFlagPayload(flagName);
      hasLoadedFeatureFlag.value = true;
    });
  });

  return {
    featureFlag,
    featureFlagPayload,
    hasLoadedFeatureFlag,
  };
};
