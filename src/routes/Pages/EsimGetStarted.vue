<script setup>
import { reactive, onMounted, watch, computed, onBeforeMount } from "vue";
import EsimService from "@/api/actions/esim-service.js";
import SubscriptionService from "@/api/settings/subscription-services.js";

import EsimStepCarousel from "@/features/eSim/EsimStepCarousel.vue";
import EsimStepZipCode from "@/features/eSim/EsimStepZipCode.vue";
import EsimStepCompatible from "@/features/eSim/EsimStepCompatible.vue";
import EsimStepCompatibleError from "@/features/eSim/EsimStepCompatibleError.vue";
import EsimStepPay from "@/features/eSim/EsimStepPay.vue";
import EsimStepCheckLock from "@/features/eSim/EsimStepCheckLock.vue";
import EsimStepAreaCode from "@/features/eSim/EsimStepAreaCode.vue";
import EsimStepConfirmNumber from "@/features/eSim/EsimStepConfirmNumber.vue";
import EsimStepInstallSettings from "@/features/eSim/EsimStepInstallSettings.vue";
import EsimStepInstallData from "@/features/eSim/EsimStepInstallData.vue";
import EsimStepFinished from "@/features/eSim/EsimStepFinished.vue";

import { getUserCountry } from "@/scripts/countries/countries";
import { useRouter } from "vue-router";
const router = useRouter();
import store from "@/store";

onMounted(() => {
  EsimService.enableESim();
  Promise.allSettled([SubscriptionService.getAddons(), EsimService.getSims()])
    .then(([addOns, simsRes]) => {
      const esimAddon = addOns?.value?.results.find(
        (addon) => addon?.addon_type === "esim"
      );
      if (esimAddon?.state === "PAID") {
        state.isPaid = true;
      }
      const sims = simsRes?.value?.data?.results;
      const simsWithNumbers = sims?.filter((sim) => sim?.msisdn);
      const hasSimWithNumbers = simsWithNumbers?.length;
      if (hasSimWithNumbers && esimAddon?.state === "PAID") {
        state.skipped = true;
        state.newNumber = simsWithNumbers[0]?.msisdn;
        state.simId = sims[0]?.id;
        nextESimStep(7);
      } else if (esimAddon?.state === "PAID" && sims.length) {
        state.skipped = true;
        state.simId = sims[0]?.id;
        nextESimStep(5);
      } else if (esimAddon?.state === "PAID") {
        state.skipped = true;
        nextESimStep(4);
      }
    })
    .catch(() => {});
});

onBeforeMount(() => {
  store.dispatch("subscription/init");
});

const state = reactive({
  eSimStep: 0, // change this number to skip steps while testing
  zipCode: "",
  newNumber: "",
  showIncompatibleScreen: false,
  simId: null,
  deviceType: "ios",
  skipped: false,
});

const subscription = computed(() => store.getters["settings/getSubscription"]);

function compatibilityRetry() {
  state.showIncompatibleScreen = false;
}

function nextESimStep(skipToStep) {
  if (skipToStep || skipToStep === 0) {
    state.eSimStep = skipToStep;
  } else {
    state.eSimStep = state.eSimStep + 1;
  }
}

function updateNewNumber(number) {
  state.newNumber = number;
}

function updateZipCode(zipCode) {
  state.zipCode = zipCode;
}

function updateDeviceType(deviceType) {
  state.deviceType = deviceType;
}

watch(
  () => subscription.value,
  (newVal) => {
    if (!!newVal && !!newVal.state) {
      const userCountry = getUserCountry(store.state.authentication?.user);
      if (
        !(
          userCountry === "US" &&
          store.state.authentication?.user?.flags?.esim_enabled &&
          store.getters["settings/isSubscribed"]
        )
        // cant check in navigation guard or onmounted because
        // they are called before aubscription is loaded
      ) {
        return router.push({ name: "Home" });
      }
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <EsimStepCarousel
    v-if="state.eSimStep === 0"
    @next="nextESimStep"
  />
  <EsimStepZipCode
    v-else-if="state.eSimStep === 1"
    @next="nextESimStep"
    @update-zip-code="updateZipCode"
  />
  <EsimStepCheckLock
    v-else-if="state.eSimStep === 2"
    :device-type="state.deviceType"
    :is-paid="state.isPaid"
    @next="nextESimStep"
    @update-device-type="updateDeviceType"
  />

  <EsimStepPay
    v-else-if="state.eSimStep === 3"
    @next="nextESimStep"
  />
  <EsimStepCompatible
    v-else-if="state.eSimStep === 4 && state.showIncompatibleScreen === false"
    :device-type="state.deviceType"
    :is-paid="state.isPaid"
    :skipped="state.skipped"
    @next="nextESimStep"
    @update-device-type="updateDeviceType"
    @incompatible="state.showIncompatibleScreen = true"
    @update-sim-id="state.simId = $event"
  />
  <EsimStepCompatibleError
    v-else-if="state.eSimStep === 4 && state.showIncompatibleScreen === true"
    @retry="compatibilityRetry"
  />

  <EsimStepAreaCode
    v-else-if="state.eSimStep === 5"
    :zip-code-initial-value="state.zipCode"
    :sim-id="state.simId"
    @next="nextESimStep"
    @update-number="updateNewNumber"
    @update-zip-code="updateZipCode"
  />
  <EsimStepConfirmNumber
    v-else-if="state.eSimStep === 6"
    :new-number="state.newNumber"
    :zip-code="state.zipCode"
    :sim-id="state.simId"
    @next="nextESimStep"
    @update-number="updateNewNumber"
  />
  <EsimStepInstallSettings
    v-else-if="state.eSimStep === 7"
    :device-type="state.deviceType"
    :sim-id="state.simId"
    @update-device-type="updateDeviceType"
    @next="nextESimStep"
  />
  <EsimStepInstallData
    v-else-if="state.eSimStep === 8"
    :device-type="state.deviceType"
    @update-device-type="updateDeviceType"
    @next="nextESimStep"
  />
  <EsimStepFinished
    v-else-if="state.eSimStep === 9"
    :new-number="state.newNumber"
  />
</template>
