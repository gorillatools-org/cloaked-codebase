<script setup>
import UiHeader from "@/features/eSim/UiHeader.vue";
import UiButton from "@/features/eSim/UiButton.vue";
import UiButtonRow from "@/features/eSim/UiButtonRow.vue";
import UiPageWrapper from "@/features/eSim/UiPageWrapper.vue";
import EsimMobileToggleWidget from "@/features/eSim/EsimMobileToggleWidget.vue";
import EsimManualActivationModal from "@/features/eSim/EsimManualActivationModal.vue";
import { PH_SCREEN_EVENT_ESIM_ACTIVATING_ESIM_SCREEN } from "@/scripts/posthogEvents";
import { computed, reactive } from "vue";

const props = defineProps({
  deviceType: {
    type: String,
    default: "ios",
  },
  simId: {
    type: [Number, null],
    required: true,
  },
});

const emit = defineEmits(["next", "updateDeviceType"]);

const state = reactive({
  showModal: false,
});

const instructions = computed(() => {
  return props.deviceType === "ios"
    ? 'In settings, tap "Finish setting up Cellular". Follow the steps on your device to install your eSIM.\n\nTo send and receive iMessages via your Cloaked eSIM number, navigate to Settings > Messages > Send & Receive and ensure your Cloaked eSIM number is enabled.'
    : 'Navigate to Network & internet > SIMs. Cloaked eSIM should appear under "Downloaded SIMs." Follow the steps on your device to install your eSIM.';
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
      <h2>Continue to your device's settings</h2>

      <h5>
        Open settings on your device and navigate to the screen below. After you
        complete the setup, return to the Cloaked app to finish installation.
      </h5>
    </UiHeader>
    <EsimMobileToggleWidget
      class="esim-mobile-toggle-widget"
      :device-type="props.deviceType"
      :img-name="`${props.deviceType}-network`"
      :instructions="instructions"
      @update-device-type="(deviceType) => emit('updateDeviceType', deviceType)"
    />

    <UiButtonRow>
      <div class="button-row-col">
        <UiButton
          gradient
          @click="emit('next')"
        >
          Continue
        </UiButton>
        <div
          class="esim-button"
          @click="state.showModal = true"
        >
          Didn't receive a notification?
        </div>
      </div>
    </UiButtonRow>
    <EsimManualActivationModal
      :visible="state.showModal"
      :device-type="props.deviceType"
      :sim-id="props.simId"
      @close="state.showModal = false"
    />
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.button-row-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  width: 100%;

  .esim-button {
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    color: $color-primary-100;
    text-decoration: underline;
    transition: transform 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: scale(1.05);
      transition: transform 0.3s ease;
    }
  }
}

.esim-mobile-toggle-widget {
  margin-bottom: 100px;
}
</style>
