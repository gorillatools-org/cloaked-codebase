<script setup>
import { computed, reactive, watch } from "vue";

import { useRoute } from "vue-router";
import NewOnboardingBreachesEmailInput from "@/features/onboarding-new/NewOnboardingBreachesEmailInput.vue";
import NewOnboardingBreachesExposuresCheck from "@/features/onboarding-new/NewOnboardingBreachesExposuresCheck.vue";
import NewOnboardingBreachesNewIdentity from "@/features/onboarding-new/NewOnboardingBreachesNewIdentity.vue";
import router from "@/routes/router";

const state = reactive({
  breach: null,
});

const route = useRoute();

const step = computed(() => {
  return route.query.step ? parseInt(route.query.step) : 1;
});

function nextStep() {
  router.push({ query: { step: step.value + 1 } });
}

function setBreach(breach) {
  state.breach = breach;
}

watch(
  () => step.value,
  (value) => {
    // NOTE: if user refreshes and there is no breach set
    // go back to step 2
    if (value === 3 && !state.breach) {
      return router.push({ query: { step: 2 } });
    }
  },
  { immediate: true }
);
</script>
<template>
  <NewOnboardingBreachesEmailInput
    v-if="step === 1"
    @next="nextStep"
  />
  <NewOnboardingBreachesExposuresCheck
    v-else-if="step === 2"
    @next="nextStep"
    @setBreach="setBreach"
  />
  <NewOnboardingBreachesNewIdentity
    v-else-if="step === 3"
    :breach="state.breach"
    @next="nextStep"
  />
</template>
<style lang="scss" scoped></style>
