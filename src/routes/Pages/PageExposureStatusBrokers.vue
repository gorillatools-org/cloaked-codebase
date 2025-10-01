<script setup>
import ExposureStatusSplash from "@/features/ExposureStatus/ExposureStatusSplash.vue";
import ExposureStatusBrokerList from "@/features/ExposureStatus/ExposureStatusBrokerList.vue";
import { useDisplay } from "@/composables/useDisplay";
import { computed, toValue } from "vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";

const {
  hasLoadedFeatureFlag: hasLoadedEnrollmentV2Flag,
  featureFlag: enrollmentV2Enabled,
} = usePostHogFeatureFlag("enrollment_v2_enabled");

const { isMobile } = useDisplay();

const props = defineProps({
  isEnrolled: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const showList = computed(() => {
  return toValue(props.isEnrolled) && !toValue(isMobile);
});

const showSplash = computed(() => {
  return (
    !toValue(props.isEnrolled) &&
    (hasLoadedEnrollmentV2Flag.value ? !enrollmentV2Enabled.value : true) &&
    !props.isLoading
  );
});
</script>

<template>
  <div>
    <ExposureStatusBrokerList v-if="showList" />
    <ExposureStatusSplash v-else-if="showSplash" />
  </div>
</template>
