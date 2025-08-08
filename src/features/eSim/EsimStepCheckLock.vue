<script setup>
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import UiButtonRow from "@/features/onboarding-new/UiButtonRow.vue";
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import EsimMobileToggleWidget from "@/features/eSim/EsimMobileToggleWidget.vue";
import AtomInputCheckbox from "@/library/AtomInputCheckbox.vue";
import { PH_SCREEN_EVENT_ESIM_ACTIVATING_ESIM_SCREEN } from "@/scripts/posthogEvents";
import { computed, reactive } from "vue";

const emit = defineEmits(["next", "updateDeviceType"]);
const props = defineProps({
  deviceType: {
    type: String,
    default: "ios",
  },
});

const state = reactive({
  checked: false,
});

const instructions = computed(() => {
  return props.deviceType === "ios"
    ? 'Open Settings > General > About, then check to make sure that "Carrier Lock" is set to "No SIM restrictions."'
    : 'Open Settings > About phone, then check to make sure that your SIM status does not say "SIM locked".';
});

function handleInput(e) {
  state.checked = e;
}
</script>
<template>
  <UiPageWrapper
    showLogo
    logo="cloaked-esim-logo"
    :screenEvent="PH_SCREEN_EVENT_ESIM_ACTIVATING_ESIM_SCREEN"
    :esimStep="2"
  >
    <UiHeader
      leftAlign
      maxWidth="450px"
    >
      <h2>Check device lock settings</h2>
      <h5>
        Before continuing, we need to confirm your device is not carrier locked.
        This is required to continue.
      </h5>
      <AtomInputCheckbox
        id="esim-lock-checkbox"
        :value="state.checked"
        @input="handleInput"
      >
        <span class="checkbox-text">
          My device has no SIM restrictions or carrier lock
        </span>
      </AtomInputCheckbox>
    </UiHeader>

    <EsimMobileToggleWidget
      class="esim-mobile-toggle-widget"
      :deviceType="props.deviceType"
      :imgName="`${props.deviceType}-lock`"
      :instructions="instructions"
      center
      @updateDeviceType="(deviceType) => emit('updateDeviceType', deviceType)"
    />
    <UiButtonRow>
      <UiButton
        gradient
        class="device-check-button"
        :disabled="!state.checked"
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

.checkbox-text {
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: $color-primary-100;
}
</style>
