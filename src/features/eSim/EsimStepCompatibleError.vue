<script setup>
import UiHeader from "@/features/eSim/UiHeader.vue";
import UiButton from "@/features/eSim/UiButton.vue";
import UiButtonRow from "@/features/eSim/UiButtonRow.vue";
import UiPageWrapper from "@/features/eSim/UiPageWrapper.vue";
import InlineSvg from "@/features/InlineSvg";
import { PH_SCREEN_EVENT_ESIM_ONBOARDING_INCOMPATIBILITY_SCREEN } from "@/scripts/posthogEvents";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";

const emit = defineEmits(["retry"]);
</script>
<template>
  <UiPageWrapper
    show-logo
    logo="cloaked-esim-logo"
    :screen-event="PH_SCREEN_EVENT_ESIM_ONBOARDING_INCOMPATIBILITY_SCREEN"
    :esim-step="2"
  >
    <UiHeader
      left-align
      max-width="450px"
    >
      <h2>Your device is not compatible with eSIM</h2>
      <h5>
        Sorry, but it looks like your device is not eSIM-compatible. Your device
        may be unable to support eSIM installation, or your device is Carrier
        locked.
      </h5>
      <h5>
        If you believe this is an error, please double check your device EID and
        IMEI numbers and try again or contact
        <a
          :href="HELP_CENTER_BASE_URL"
          target="_blank"
        >
          <u>Cloaked Support</u>
        </a>
        .
      </h5>
    </UiHeader>

    <InlineSvg name="esim-incompatible" />
    <UiButtonRow>
      <UiButton
        gradient
        @click="emit('retry')"
      >
        Try Again
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>
</template>
