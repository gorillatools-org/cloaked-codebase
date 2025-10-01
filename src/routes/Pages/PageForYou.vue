<script setup>
import { computed, watch, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import ForYouDiscoverList from "@/features/ForYou/ForYouDiscoverList.vue";
import ForYouActivatedList from "@/features/ForYou/ForYouActivatedList.vue";

import store from "@/store";
import { useBasicMode } from "@/composables/useBasicMode.js";
import { useFeatures } from "@/composables/useFeatures.js";

const router = useRouter();
const route = useRoute();
const contentRef = ref(null);
const transitionName = ref("slide-left");
const previousPath = ref("");
const isTransitioning = ref(false);

const { isBasicModeEnabled } = useBasicMode();
const { hasForYou, hasIdentityMonitoring, hasVpnEnabled } = useFeatures();

onMounted(() => {
  previousPath.value = route.fullPath;

  if (contentRef.value) {
    contentRef.value.scrollTop = 0;
  }
});

// Handle before-leave transition event
const handleBeforeLeave = () => {
  isTransitioning.value = true;
};

// Handle after-leave transition event
const handleAfterLeave = () => {
  // Scroll to top after the leave animation
  if (contentRef.value) {
    contentRef.value.scrollTop = 0;
  }
  window.scrollTo(0, 0);
};

// Handle after-enter transition event
const handleAfterEnter = () => {
  isTransitioning.value = false;

  // Make sure content is properly positioned for scrolling
  setTimeout(() => {
    // Reset any absolute positioning that might affect scrolling
    const componentWrapper = document.querySelector(".component-wrapper");
    if (componentWrapper) {
      componentWrapper.style.position = "relative";
      componentWrapper.style.height = "auto";

      // Make sure the content area can scroll if needed
      if (contentRef.value) {
        // Enable scrolling
        contentRef.value.style.overflowY = "auto";
      }
    }
  }, 50);
};

// Watch for route changes to set transition direction
watch(
  () => route.fullPath,
  (newPath) => {
    // Determine transition direction - enhanced logic for feature-to-feature navigation
    const goingToFeature = newPath.includes("/for-you/feature/");
    const comingFromFeature =
      previousPath.value && previousPath.value.includes("/for-you/feature/");

    if (goingToFeature && comingFromFeature) {
      // Going from feature to feature - use vertical slide
      transitionName.value = "slide-down";
    } else if (goingToFeature && !comingFromFeature) {
      // Going from list to feature
      transitionName.value = "slide-left";
    } else if (!goingToFeature && comingFromFeature) {
      // Going from feature to list
      transitionName.value = "slide-right";
    } else {
      // Default (other cases)
      transitionName.value = "slide-left";
    }

    // Update previous path after direction is determined
    previousPath.value = newPath;
  }
);

const userLoaded = computed(() => !!store.state.authentication?.user);

const basicModeEnabled = computed(() => isBasicModeEnabled.value);

watch(
  [userLoaded, hasForYou, basicModeEnabled],
  ([loaded, hasFeature, isBasicMode]) => {
    if (loaded && (!hasFeature || !isBasicMode)) {
      router.push("/");
    } else {
      // Features should already be loaded from Boot.vue, but add fallback just in case
      const featuresData = store.state.features?.features;
      const hasFeatureData =
        featuresData &&
        typeof featuresData === "object" &&
        Array.isArray(featuresData.results) &&
        featuresData.results.length > 0;

      if (!hasFeatureData) {
        // Fallback: fetch features if somehow they weren't loaded during boot
        console.warn("Features not available, fetching as fallback");
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
  const targetFeatures = ["id_monitoring", "data_deletion", "id_theft", "vpn"];

  const featureMap = {
    id_monitoring: !!hasIdentityMonitoring.value,
    data_deletion: true,
    id_theft: true,
    vpn: !!hasVpnEnabled.value,
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
    <div
      ref="contentRef"
      class="page-for-you__content"
    >
      <div
        class="transition-container"
        :class="{ 'is-transitioning': isTransitioning }"
      >
        <Transition
          :name="transitionName"
          @before-leave="handleBeforeLeave"
          @after-leave="handleAfterLeave"
          @after-enter="handleAfterEnter"
        >
          <div
            :key="route.fullPath"
            class="component-wrapper"
          >
            <!-- Show either the router view (child route) or the discover list (main route) -->
            <template v-if="$route.name === 'ForYouFeature'">
              <router-view />
            </template>
            <ForYouDiscoverList
              v-else
              :discover-features="disabledFeatures"
            />
          </div>
        </Transition>
      </div>
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
/* stylelint-disable */
.page-for-you {
  display: flex;
  height: 100%;
  padding: 0 8px 8px 0px;
  gap: 8px;
  overflow: hidden;
  position: relative;

  &__content {
    flex: 1;
    border-radius: 20px;
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

.transition-container {
  position: relative;
  width: 100%;
  height: auto;
  min-height: 100%;
  overflow: visible; /* Change from hidden to visible to allow content to be scrollable */

  &.is-transitioning {
    overflow: hidden; /* Only hide overflow during transitions */
    pointer-events: none;
  }
}

.component-wrapper {
  width: 100%;
  /* Only use absolute positioning during transitions */
  position: relative; /* Default to relative */
  height: auto; /* Allow height to grow with content */
}

// Transition Animations
.slide-left-enter-active,
.slide-right-enter-active,
.slide-down-enter-active {
  transition:
    transform 0.5s ease 0.2s,
    opacity 0.5s ease 0.4s;
  position: absolute; /* Absolute only during animation */
  width: 100%;
  left: 0;
  top: 0;
  z-index: 2;
}

.slide-left-leave-active,
.slide-right-leave-active,
.slide-down-leave-active {
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
  position: absolute; /* Absolute only during animation */
  width: 100%;
  left: 0;
  top: 0;
  z-index: 1;
}

// Sliding left (forward) transition
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

// Sliding right (backward) transition
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

// Sliding down (feature to feature) transition
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-50px);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(50px);
}

// After animation, return to normal flow
.slide-left-enter-to,
.slide-right-enter-to,
.slide-down-enter-to {
  position: relative;
}
</style>
