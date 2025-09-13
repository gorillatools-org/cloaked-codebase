<script setup>
import UiHeader from "@/features/eSim/UiHeader.vue";
import UiButton from "@/features/eSim/UiButton.vue";
import UiButtonRow from "@/features/eSim/UiButtonRow.vue";
import UiPageWrapper from "@/features/eSim/UiPageWrapper.vue";
import AtomInputInternalLabels from "@/library/AtomInputInternalLabels.vue";
import { PH_SCREEN_EVENT_ESIM_ONBOARDING_COMPATIBILITY_SCREEN } from "@/scripts/posthogEvents";
import EsimMobileToggleWidget from "@/features/eSim/EsimMobileToggleWidget.vue";
import ESimService from "@/api/actions/esim-service.js";

import { reactive, ref, nextTick, computed } from "vue";
import { useToast } from "@/composables/useToast.js";
const toast = useToast();

const props = defineProps({
  deviceType: {
    type: String,
    default: "ios",
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  skipped: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "next",
  "updateDeviceType",
  "incompatible",
  "updateSimId",
]);

const imeiInput = ref(null);
const eidInput = ref(null);

const state = reactive({
  imei: "",
  imeiInputError: null,

  eid: "",
  eidInputError: null,
  coverageError: null,
  loading: false,
});

const instructions = computed(() => {
  return props.deviceType === "android"
    ? "Open Settings > About Phone, then enter your device's EID and IMEI numbers below. If there are multiple, look for an “eSIM” or “SIM Slot 2” label."
    : "Open Settings > General > About, then enter your device's EID and IMEI numbers below.";
});

async function checkDeviceValidity() {
  state.loading = true;
  state.imei = state.imei.replace(/\s+/g, "");
  state.eid = state.eid.replace(/\s+/g, "");
  if (state.imei.length != 15) {
    state.imeiInputError = true;
  } else {
    state.imeiInputError = false;
  }
  if (state.eid.length != 32) {
    state.eidInputError = true;
  } else {
    state.eidInputError = false;
  }
  if (!state.eidInputError && !state.imeiInputError) {
    try {
      let res = await ESimService.createDeviceTmobile(state.imei, state.eid);
      checkCompatibility(res);
    } catch (e) {
      state.loading = false;
      if (e?.response?.status == 503) {
        toast.error(
          "There was an error loading your sim. Please contact support@cloaked.app"
        );
      } else if (e?.response?.status == 429) {
        toast.error(
          "You have been rate limited. Please contact support@cloaked.app"
        );
      } else {
        checkCompatibility(e?.response);
      }
    }
  }
  state.loading = false;
}

function checkCompatibility(res) {
  const simID = res?.data?.device?.sims[0]?.id;
  emit("updateSimId", simID);
  const esimCompatible = res?.data?.device?.compatibility?.esim;
  const imeiCompatible = res?.data?.device?.compatibility?.compatible_imei;

  if (!simID || !esimCompatible || !imeiCompatible) {
    emit("incompatible");
  } else {
    emit("next");
  }
}

function nextInput() {
  if (state.eid.length !== 32) {
    state.eidInputError = true;
  } else {
    state.eidInputError = false;
    nextTick(() => {
      imeiInput?.value?.$refs?.inputRef?.focus();
    });
  }
}

function handleEIDInput(event) {
  state.eidInputError = false;
  state.eid = event.target.value;
}
function handleIMEIInput(event) {
  state.imeiInputError = false;
  state.imei = event.target.value;
}
</script>
<template>
  <UiPageWrapper
    show-logo
    logo="cloaked-esim-logo"
    :screen-event="PH_SCREEN_EVENT_ESIM_ONBOARDING_COMPATIBILITY_SCREEN"
    :esim-step="4"
  >
    <UiHeader
      left-align
      max-width="450px"
    >
      <h2 v-if="props.skipped">Register your device</h2>
      <h2 v-else>Purchase successful! Now register your device</h2>
      <h5>Please enter your device EID and IMEI numbers below.</h5>
    </UiHeader>
    <EsimMobileToggleWidget
      :device-type="props.deviceType"
      :instructions="instructions"
      :img-name="
        props.deviceType === 'android' ? 'android-general' : 'ios-general'
      "
      @update-device-type="(deviceType) => emit('updateDeviceType', deviceType)"
    />

    <div class="input-fields">
      <AtomInputInternalLabels
        ref="eidInput"
        autofocus
        :is-loading="state.loading"
        :value="state.eid"
        label="EID Number"
        type="text"
        placeholder="Enter EID Number"
        :disabled="state.loading"
        :pattern="/^[0-9]*$/"
        :error="state.eidInputError"
        error-message="EID Numbers must be 32 characters"
        @input="handleEIDInput"
        @keydown.enter.prevent="nextInput"
        @keydown.tab.prevent="nextInput"
      />

      <AtomInputInternalLabels
        ref="imeiInput"
        :is-loading="state.loading"
        :value="state.imei"
        label="IMEI Number"
        type="text"
        placeholder="Enter IMEI Number"
        :disabled="state.loading"
        :pattern="/^[0-9]*$/"
        :error="state.imeiInputError"
        error-message="IMEI Numbers must be 15 characters"
        @input="handleIMEIInput"
        @keydown.enter="checkDeviceValidity"
      />
    </div>

    <UiButtonRow>
      <UiButton
        gradient
        class="device-check-button"
        :loading="state.loading"
        :disabled="
          state.loading ||
          state.eidInputError ||
          state.imeiInputError ||
          !state.eid?.length ||
          !state.imei?.length
        "
        @click="checkDeviceValidity"
      >
        {{ state.loading ? "Creating" : "Create Device" }}
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.input-fields {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  gap: 8px;
  margin-top: 16px;
  padding-bottom: 100px;
  max-width: 450px;
}
</style>
