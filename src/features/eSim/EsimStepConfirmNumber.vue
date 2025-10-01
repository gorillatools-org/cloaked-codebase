<script setup>
import UiHeader from "@/features/eSim/UiHeader.vue";
import UiButton from "@/features/eSim/UiButton.vue";
import UiButtonRow from "@/features/eSim/UiButtonRow.vue";
import UiPageWrapper from "@/features/eSim/UiPageWrapper.vue";
import AtomInputInternalLabels from "@/library/AtomInputInternalLabels.vue";
import InlineSvg from "@/features/InlineSvg";
import { PH_SCREEN_EVENT_ESIM_ACTIVATING_ESIM_SCREEN } from "@/scripts/posthogEvents";
import { computed, reactive } from "vue";
import { useToast } from "@/composables/useToast.js";
import ESimService from "@/api/actions/esim-service.js";
import { format } from "@/scripts/format";
const toast = useToast();

const props = defineProps({
  newNumber: {
    type: String,
    required: true,
  },
  simId: {
    type: [Number, null],
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
});

const state = reactive({
  loading: false,
});

const emit = defineEmits(["next", "updateNumber"]);

const phoneFormatted = computed(() => {
  return format.phone_format(props.newNumber);
});

function refreshSimNumber() {
  if (state.loading) return;
  state.loading = true;
  ESimService.activateSim(props.simId, props.zipCode)
    .then((response) => {
      state.loading = false;
      emit("updateNumber", response?.data?.assignment?.msisdn);
    })
    .catch(() => {
      state.loading = false;
      toast.error("Error changing your eSIM number");
    });
}

function handleContinue() {
  state.loading = true;
  ESimService.confirmEsimProfile(props.simId)
    .then(() => {
      emit("next");
    })
    .catch(() => {
      state.loading = false;
      toast.error("Error confirming your eSIM");
    });
}
</script>
<template>
  <UiPageWrapper
    show-logo
    logo="cloaked-esim-logo"
    :screen-event="PH_SCREEN_EVENT_ESIM_ACTIVATING_ESIM_SCREEN"
    :esim-step="6"
  >
    <UiHeader
      left-align
      max-width="450px"
    >
      <h2>Confirm your new number</h2>
      <h5>
        Tap below to confirm your new number and transmit your eSIM to your
        device.
      </h5>
      <AtomInputInternalLabels
        :value="phoneFormatted"
        label="Your eSim Number"
        type="text"
        :placeholder="phoneFormatted"
        readonly
        center
        :is-loading="state.loading"
      >
        <InlineSvg
          name="refresh"
          class="refresh-icon"
          :class="{ loading: state.loading }"
          @click.stop.prevent="refreshSimNumber"
        />
      </AtomInputInternalLabels>
      <InlineSvg name="esim-simcard-variant" />
    </UiHeader>
    <UiButtonRow>
      <UiButton
        gradient
        :disabled="state.loading"
        :loading="state.loading"
        @click="handleContinue"
      >
        Continue
      </UiButton>
    </UiButtonRow>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.refresh-icon {
  width: 22px;
  height: auto;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin-right: 10px;

  &:hover {
    transform: scale(1.05);
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  &:active {
    transform: scale(1) rotate(180deg);
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
}
</style>
