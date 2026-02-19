<script setup>
import { computed } from "vue";
import BaseButton from "@/library/BaseButton.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT } from "@/scripts/posthogEvents";

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT
);

const isBlueCheckout = computed(
  () =>
    hasLoadedFeatureFlag.value &&
    featureFlag.value === "checkout-cta-blue-color"
);

const props = defineProps({
  type: {
    type: String,
    default: "individual",
    validator: (value) => ["individual", "couple", "family"].includes(value),
  },
});

const backgroundColor = computed(() => {
  if (isBlueCheckout.value === true) {
    return "brand-3-gradient";
  } else if (props.type === "couple") {
    return "brand-2-gradient";
  } else if (props.type === "family") {
    return "brand-3-gradient";
  } else {
    return "info-gradient";
  }
});
</script>

<template>
  <BaseButton :background-color="backgroundColor">
    <slot />
  </BaseButton>
</template>
