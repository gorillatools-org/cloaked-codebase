<script setup>
import ExposureStatusBrokerList from "@/features/ExposureStatus/ExposureStatusBrokerList.vue";
import { useDisplay } from "@/composables/useDisplay";
import { computed, toValue } from "vue";

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
</script>

<template>
  <div>
    <ExposureStatusBrokerList v-if="showList" />
  </div>
</template>
