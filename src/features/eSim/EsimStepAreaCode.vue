<script setup>
import UiHeader from "@/features/eSim/UiHeader.vue";
import UiButton from "@/features/eSim/UiButton.vue";
import UiButtonRow from "@/features/eSim/UiButtonRow.vue";
import UiPageWrapper from "@/features/eSim/UiPageWrapper.vue";
import AtomInputInternalLabels from "@/library/AtomInputInternalLabels.vue";
import ESimService from "@/api/actions/esim-service.js";
import { useToast } from "@/composables/useToast.js";

import { reactive } from "vue";

import {
  PH_SCREEN_EVENT_ESIM_ONBOARDING_AREA_CODE_SCREEN,
  PH_EVENT_ESIM_USER_CHANGED_ZIP_CODE,
} from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";

const toast = useToast();

const emit = defineEmits(["next", "updateNumber", "updateZipCode"]);
const props = defineProps({
  zipCodeInitialValue: {
    type: String,
    default: "",
  },
  simId: {
    type: [Number, null],
    required: true,
  },
});

const state = reactive({
  loading: false,
  zipCode: props.zipCodeInitialValue,
  zipError: false,
  eSimStep: 5,
});

async function completeESim() {
  if (state.loading) return;
  state.loading = true;
  if (state.zipCode?.length !== 5) {
    state.zipError = true;
  } else {
    state.zipError = false;
    if (state.zipCode !== props.zipCodeInitialValue) {
      // capturing possible bad actors
      posthogCapture(PH_EVENT_ESIM_USER_CHANGED_ZIP_CODE);
    }

    return ESimService.activateSim(props.simId, state.zipCode)
      .then((response) => {
        emit("updateZipCode", state.zipCode);
        emit("updateNumber", response?.data?.assignment?.msisdn);
        emit("next");

        state.loading = false;
      })
      .catch(() => {
        state.loading = false;
        toast.error("Error activating your eSIM");
      });
  }
  state.loading = false;
}
</script>
<template>
  <UiPageWrapper
    show-logo
    logo="cloaked-esim-logo"
    :screen-event="PH_SCREEN_EVENT_ESIM_ONBOARDING_AREA_CODE_SCREEN"
    :esim-step="4"
  >
    <UiHeader
      left-align
      max-width="450px"
    >
      <h2>Choose an area code for your new phone number</h2>
      <h5>
        Enter your home ZIP code below and we'll create a phone number with a
        matching area code.
      </h5>
      <AtomInputInternalLabels
        :value="state.zipCode"
        label="ZIP Code"
        type="text"
        :placeholder="state.zipCode"
        :disabled="state.loading"
        :pattern="/^[0-9]*$/"
        :error="state.zipError"
        :is-loading="state.loading"
        error-message="Please enter a valid zip code."
        @input="(event) => (state.zipCode = event.target.value)"
        @keydown.enter.prevent="completeESim"
        @keydown.tab.prevent="completeESim"
      />
      <h6>
        This ZIP code will determine the first 3 digits of your eSIM number.
      </h6>
    </UiHeader>

    <UiButtonRow>
      <UiButton
        gradient
        class="device-check-button"
        :loading="state.loading"
        :disabled="state.loading || !state.zipCode"
        @click="completeESim"
      >
        Install eSim
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>
</template>
