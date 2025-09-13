import { onBeforeMount, ref } from "vue";
import { getPosthog } from "@/scripts/posthog";

export function fetchFeatureFlag(flagName) {
  return new Promise((resolve) => {
    getPosthog().then((posthog) => {
      posthog?.onFeatureFlags?.(() => {
        resolve({
          value: posthog.getFeatureFlag(flagName),
          payload: posthog.getFeatureFlagPayload(flagName),
        });
      });
    });
  });
}

export const usePostHogFeatureFlag = (flagName) => {
  const featureFlag = ref(null);
  const featureFlagPayload = ref(null);
  const hasLoadedFeatureFlag = ref(false);

  onBeforeMount(async () => {
    const { value, payload } = await fetchFeatureFlag(flagName);
    featureFlag.value = value;
    featureFlagPayload.value = payload;
    hasLoadedFeatureFlag.value = true;
  });

  return {
    featureFlag,
    featureFlagPayload,
    hasLoadedFeatureFlag,
  };
};
