<script setup>
import { computed, watch } from "vue";
import { useRouter } from "vue-router";

import ForYouDiscoverList from "@/features/ForYou/ForYouDiscoverList.vue";
import ForYouActivatedList from "@/features/ForYou/ForYouActivatedList.vue";

import store from "@/store";
import { useBasicMode } from "@/composables/useBasicMode.js";
import { useFeatures } from "@/composables/useFeatures.js";

const router = useRouter();
const { isBasicModeAccessible, isBasicModeEnabled } = useBasicMode();
const { hasForYou, hasIdentityMonitoring } = useFeatures();

const userLoaded = computed(() => !!store.state.authentication?.user);

const basicModeEnabled = computed(
  () => isBasicModeAccessible.value && isBasicModeEnabled.value
);

watch(
  [userLoaded, hasForYou, basicModeEnabled],
  ([loaded, hasFeature, isBasicMode]) => {
    if (loaded && (!hasFeature || !isBasicMode)) {
      router.push("/");
    } else {
      const featuresData = store.state.features?.features;
      const hasFeatureData =
        featuresData &&
        typeof featuresData === "object" &&
        Array.isArray(featuresData.results) &&
        featuresData.results.length > 0;

      if (!hasFeatureData) {
        store.dispatch("fetchFeatures").then(() => {
          enableDiscoveryFeatures();
        });
      } else {
        enableDiscoveryFeatures();
      }
    }
  },
  { immediate: true }
);

// Access features from the proper location in the store
const features = computed(() => {
  const featuresData = store.state.features?.features;
  return featuresData && typeof featuresData === "object"
    ? featuresData
    : { results: [] };
});

// Find the discover_tab feature
const discoverTabFeature = computed(() => {
  const results = features.value.results;
  if (!results || !Array.isArray(results)) return null;

  return (
    results.find(
      (feature) => feature && feature.internal_name === "discover_tab"
    ) || null
  );
});

const isDiscoverTabEnabled = computed(() => {
  return !!discoverTabFeature.value?.enabled;
});

const enabledFeatures = computed(() => {
  const results = features.value.results;
  if (!results || !Array.isArray(results)) return [];

  return results.filter(
    (feature) =>
      feature &&
      feature.internal_name &&
      feature.internal_name !== "discover_tab" &&
      feature.enabled
  );
});

const disabledFeatures = computed(() => {
  const results = features.value.results;
  if (!results || !Array.isArray(results)) return [];

  return results.filter(
    (feature) =>
      feature &&
      feature.internal_name &&
      feature.internal_name !== "discover_tab" &&
      !feature.enabled
  );
});

const shouldEnableDiscoveryFeatures = () => {
  if (isDiscoverTabEnabled.value) return false;

  const targetFeatures = ["id_monitoring", "data_deletion", "id_theft"];
  const allTargetFeaturesEnabled = targetFeatures.every((featureName) => {
    const feature = features.value.results?.find(
      (f) => f.internal_name === featureName
    );
    return feature?.enabled === true;
  });

  return !allTargetFeaturesEnabled;
};

const getFeatureIdsToEnable = () => {
  const targetFeatures = ["id_monitoring", "data_deletion", "id_theft"];

  const featureMap = {
    id_monitoring: !!hasIdentityMonitoring.value,
    data_deletion: true,
    id_theft: true,
  };

  return disabledFeatures.value
    .filter(
      (feature) =>
        featureMap[feature.internal_name] &&
        targetFeatures.includes(feature.internal_name)
    )
    .map((feature) => feature.id);
};

const getValidFeatureIds = (featureIds) => {
  const featureIdsArray = Array.isArray(featureIds) ? featureIds : [];

  return featureIdsArray
    .filter((id) => {
      const numId = Number(id);
      return !isNaN(numId) && Number.isInteger(numId);
    })
    .map((id) => Number(id));
};

const enableDiscoveryFeatures = () => {
  if (!shouldEnableDiscoveryFeatures()) return;

  const featureIdsToEnable = getFeatureIdsToEnable();

  if (featureIdsToEnable.length === 0) return;

  const validFeatureIds = getValidFeatureIds(featureIdsToEnable);

  if (validFeatureIds.length === 0) return;

  const discoverTab = discoverTabFeature.value;

  if (discoverTab && discoverTab.id) {
    store
      .dispatch("initialEnableDiscover", {
        discoverFeatureId: Number(discoverTab.id),
        featureIds: validFeatureIds,
      })
      .then(() => {
        store.dispatch("fetchFeatures");
      });
  }
};
</script>

<template>
  <div class="page-for-you">
    <div class="page-for-you__content">
      <ForYouDiscoverList :discover-features="disabledFeatures" />
    </div>

    <aside
      v-if="enabledFeatures.length !== 0"
      class="page-for-you__sidebar"
    >
      <ForYouActivatedList :activated-features="enabledFeatures" />
    </aside>
  </div>
</template>

<style lang="scss" scoped>
.page-for-you {
  display: flex;
  height: 100%;
  padding: 0 8px 8px 8px;
  gap: 8px;
  overflow: hidden;
  position: relative;

  &__content {
    flex: 1;
    border-radius: 20px;
    padding: 24px;
    overflow-y: auto;
    @include custom-scroll-bar;
    position: relative;
    z-index: 1;
    width: 100%;
    background-color: $color-primary-5;
  }

  &__sidebar {
    width: 406px;
    padding: 24px;
    flex-shrink: 0;
    background-color: $color-primary-5;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-x: hidden;
    overflow-y: auto;
    @include custom-scroll-bar;
    position: relative;
    z-index: 1;
  }

  &__feature {
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 12px;
    background-color: $color-primary-10;
  }
}
</style>
