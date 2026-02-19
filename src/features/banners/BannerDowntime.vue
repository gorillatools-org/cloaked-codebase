<script setup>
import { computed } from "vue";
import store from "@/store";
import { toValue } from "@vueuse/core/index";
import AtomTopBanner from "@/library/AtomTopBanner.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";

const { featureFlag, featureFlagPayload } = usePostHogFeatureFlag(
  "cloaked-experiencing-downtime"
);

const audience = computed(() => toValue(featureFlagPayload)?.audience ?? "all");

const variant = computed(
  () => toValue(featureFlagPayload)?.variant ?? "danger"
);

const message = computed(
  () =>
    toValue(featureFlagPayload)?.message ??
    "We are experiencing intermittent service disruptions due to issues with one of our technology service providers. Our team is actively working to resolve these challenges as quickly as possible - rest assured, your information remains safe."
);

const isVisible = computed(() => {
  if (toValue(featureFlag) !== true) {
    return false;
  }

  if (toValue(audience) === "paid") {
    return (
      store.getters["settings/isSubscribed"] ||
      store.getters["settings/isLegacy"]
    );
  }

  return true;
});
</script>

<template>
  <AtomTopBanner
    v-if="isVisible"
    :variant="variant"
  >
    {{ message }}
  </AtomTopBanner>
</template>
