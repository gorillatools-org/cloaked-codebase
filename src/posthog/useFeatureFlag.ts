import { onBeforeMount, shallowReactive } from "vue";
import { getPosthog } from "@/scripts/posthog";
import type {
  FeatureFlagName,
  FeatureFlagValue,
  FeatureFlagPayload,
} from "./featureFlags.types";
import type { PostHog } from "posthog-js";

export type FeatureFlagResult<V, P> = {
  value: V | null;
  payload: P | null;
  loaded: boolean;
};

// Track if PostHog flags have been loaded (shared across all calls)
let flagsReady = false;
// Cached promise, so we don't need to call onFeatureFlags more than once
let posthogInstancePromise: Promise<PostHog> | null = null;

function getPosthogInstance(): Promise<PostHog> {
  if (posthogInstancePromise) return posthogInstancePromise;

  posthogInstancePromise = new Promise((resolve) => {
    getPosthog().then((posthog) => {
      if (flagsReady) {
        return resolve(posthog);
      }

      posthog.onFeatureFlags?.(() => {
        flagsReady = true;
        resolve(posthog);
      });
    });
  });

  return posthogInstancePromise;
}

async function fetchFeatureFlag<K extends FeatureFlagName>(
  flagName: K
): Promise<{
  value: FeatureFlagValue<K> | null;
  payload: FeatureFlagPayload<K> | null;
}> {
  const posthog = await getPosthogInstance();

  return {
    value: posthog.getFeatureFlag(flagName) as FeatureFlagValue<K> | null,
    payload: posthog.getFeatureFlagPayload(
      flagName
    ) as FeatureFlagPayload<K> | null,
  };
}

export function useFeatureFlag<K extends FeatureFlagName>(
  flagName: K
): Readonly<FeatureFlagResult<FeatureFlagValue<K>, FeatureFlagPayload<K>>> {
  const state = shallowReactive<
    FeatureFlagResult<FeatureFlagValue<K>, FeatureFlagPayload<K>>
  >({
    value: null,
    payload: null,
    loaded: false,
  });

  onBeforeMount(async () => {
    const result = await fetchFeatureFlag(flagName);
    state.value = result.value;
    state.payload = result.payload;
    state.loaded = true;
  });

  return state;
}
