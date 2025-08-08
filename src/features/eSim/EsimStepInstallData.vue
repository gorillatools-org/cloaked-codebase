<script setup>
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import UiButtonRow from "@/features/onboarding-new/UiButtonRow.vue";
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
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
    showLogo
    logo="cloaked-esim-logo"
    :screenEvent="PH_SCREEN_EVENT_ESIM_ACTIVATING_ESIM_SCREEN"
    :esimStep="7"
  >
    <UiHeader
      leftAlign
      maxWidth="450px"
    >
      <h2>Set cellular data preferences</h2>
      <h5>
        Before continuing, be sure your cellular data is set to your Primary
        cell provider and ensure mobile data is off for your Cloaked eSIM.
      </h5>
    </UiHeader>

    <EsimMobileToggleWidget
      class="esim-mobile-toggle-widget"
      :deviceType="props.deviceType"
      :imgName="`${props.deviceType}-data`"
      :instructions="instructions"
      center
      @updateDeviceType="(deviceType) => emit('updateDeviceType', deviceType)"
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
