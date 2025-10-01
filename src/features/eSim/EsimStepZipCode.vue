<script setup>
import UiHeader from "@/features/eSim/UiHeader.vue";
import UiButton from "@/features/eSim/UiButton.vue";
import UiButtonRow from "@/features/eSim/UiButtonRow.vue";
import UiPageWrapper from "@/features/eSim/UiPageWrapper.vue";
import ESimService from "@/api/actions/esim-service.js";
import AtomInputInternalLabels from "@/library/AtomInputInternalLabels.vue";
import { PH_SCREEN_EVENT_ESIM_ONBOARDING_COVERAGE_SCREEN } from "@/scripts/posthogEvents";
import { useToast } from "@/composables/useToast.js";
import { reactive } from "vue";

const toast = useToast();
const state = reactive({
  loading: false,
  zipCode: "",
  zipError: false,
});

const emit = defineEmits(["next", "updateZipCode"]);

const checkCoverage = async () => {
  state.loading = true;
  let coverage = null;
  if (state.zipCode?.length !== 5) {
    state.zipError = true;
  } else {
    state.zipError = false;
    coverage = await ESimService.checkCoverage({ zipCode: state.zipCode });
  }
  if (coverage) {
    emit("updateZipCode", state.zipCode);
    emit("next");
  } else if (coverage == false) {
    toast.error("Unfortunately there is no coverage in this area");
  }
  state.loading = false;
};
</script>
<template>
  <UiPageWrapper
    show-logo
    logo="cloaked-esim-logo"
    :screen-event="PH_SCREEN_EVENT_ESIM_ONBOARDING_COVERAGE_SCREEN"
    :esim-step="1"
  >
    <UiHeader
      left-align
      max-width="450px"
    >
      <h2>Check for cell coverage</h2>
      <h5>
        We need to check that you're located in a covered area within the United
        States.
      </h5>
      <h5>Please enter your home ZIP code.</h5>
      <AtomInputInternalLabels
        autofocus
        :is-loading="state.loading"
        :value="state.zipCode"
        label="Zip Code"
        type="number"
        placeholder="Enter Zip Code"
        :disabled="state.loading"
        :pattern="/^[0-9]*$/"
        :min="0"
        :max="99999"
        :error="state.zipError"
        error-message="Please enter a valid zip code"
        @input="(event) => (state.zipCode = event.target.value)"
        @save="checkCoverage"
        @keydown.enter="checkCoverage"
      />
      <h6>This information is never stored or shared.</h6>
    </UiHeader>

    <UiButtonRow>
      <UiButton
        gradient
        img-name="arrow-long-right"
        class="device-check-button"
        :loading="state.loading"
        :disabled="state.loading || !state.zipCode"
        @click="checkCoverage"
      >
        {{ state.loading ? "Checking Coverage" : "Continue" }}
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>
</template>
