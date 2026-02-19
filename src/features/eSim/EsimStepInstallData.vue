<script setup>
import UiHeader from "@/features/eSim/UiHeader.vue";
import UiButton from "@/features/eSim/UiButton.vue";
import UiButtonRow from "@/features/eSim/UiButtonRow.vue";
import UiPageWrapper from "@/features/eSim/UiPageWrapper.vue";
import EsimMobileToggleWidget from "@/features/eSim/EsimMobileToggleWidget.vue";

import { PH_SCREEN_EVENT_ESIM_ACTIVATING_ESIM_SCREEN } from "@/scripts/posthogEvents";
import { computed } from "vue";

const emit = defineEmits(["next", "updateDeviceType"]);
const props = defineProps({
  deviceType: {
    type: String,
    default: "ios",
  },
});

const instructions = computed(() => {
  return props.deviceType === "ios"
    ? "Open your device's cellular data settings by navigating to Settings > Cellular > Cellular Data."
    : "Open your device's cellular data settings by navigating to Settings > Network & internet > SIMs, then tap on Cloaked eSIM.";
});
</script>
<template>
  <UiPageWrapper
    show-logo
    logo="cloaked-esim-logo"
    :screen-event="PH_SCREEN_EVENT_ESIM_ACTIVATING_ESIM_SCREEN"
    :esim-step="7"
  >
    <UiHeader
      left-align
      max-width="450px"
    >
      <h2>Set cellular data preferences</h2>
      <h5>
        Before continuing, be sure your cellular data is set to your Primary
        cell provider and ensure mobile data is off for your Cloaked eSIM.
      </h5>
    </UiHeader>

    <EsimMobileToggleWidget
      class="esim-mobile-toggle-widget"
      :device-type="props.deviceType"
      :img-name="`${props.deviceType}-data`"
      :instructions="instructions"
      center
      @update-device-type="(deviceType) => emit('updateDeviceType', deviceType)"
    />
    <UiButtonRow>
      <UiButton
        gradient
        class="device-check-button"
        @click="emit('next')"
      >
        Continue
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>
</template>
<style scoped lang="scss">
.esim-mobile-toggle-widget {
  margin-bottom: 100px;
}
</style>
