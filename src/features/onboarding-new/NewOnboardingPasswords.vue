<script setup>
import NewOnboardingPasswordsExtensionIntro from "@/features/onboarding-new/NewOnboardingPasswordsExtensionIntro.vue";
import NewOnboardingPasswordsExtensionOutro from "@/features/onboarding-new/NewOnboardingPasswordsExtensionOutro.vue";
import NewOnboardingPasswordsImport from "@/features/onboarding-new/NewOnboardingPasswordsImport.vue";
import { HAS_ACTIVATED_PLUGIN } from "@/scripts/userFlags";

import { watch, computed, nextTick } from "vue";
import router from "@/routes/router";

import { useRoute } from "vue-router";
import store from "@/store";

const route = useRoute();

const extensionInstalled = computed(() => {
  return (
    store.getters.getFlag(HAS_ACTIVATED_PLUGIN) ||
    store.getters["browser/pluginDetected"]
  );
});

const step = computed(() => {
  return route.query.step ? parseInt(route.query.step) : 1;
});

function nextStep(skipToEnd) {
  if (skipToEnd) {
    router.replace({
      query: {
        ...route.query,
        step: 3,
      },
    });
  } else {
    router.replace({
      query: {
        ...route.query,
        step: step.value + 1,
      },
    });
  }
}

const unwatchExtensionInstalled = watch(
  () => extensionInstalled.value,
  (value) => {
    if (value && step.value === 1) {
      nextStep();
      nextTick(() => unwatchExtensionInstalled());
    }
  },
  { immediate: true }
);
</script>
<template>
  <NewOnboardingPasswordsExtensionIntro
    v-if="step === 1"
    @next="nextStep"
  />
  <NewOnboardingPasswordsExtensionOutro
    v-else-if="step === 2"
    @next="nextStep"
  />
  <NewOnboardingPasswordsImport
    v-else-if="step === 3"
    @next="nextStep"
  />
</template>
<style lang="scss" scoped></style>
