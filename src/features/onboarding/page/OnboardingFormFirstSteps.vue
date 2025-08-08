<script setup>
import AppFormRadio from "@/features/AppFormRadio.vue";
import { computed, onMounted } from "vue";
import { PH_EVENT_USER_VIEWED_SETUPONBOARDING_INTENT } from "@/scripts/posthogEvents.js";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog.js";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["input", "back", "finished"]);
const firstSteps = computed({
  get: () => props.value.firstSteps,
  set: (value) => emit("input", { ...props.value, firstSteps: value }),
});

const ddInAppSearchEnabled = computed(
  () => store.getters["dataDelete/getDdInAppSearchEnabled"]
);

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_SETUPONBOARDING_INTENT);
});
</script>

<template>
  <div class="onboarding-form__content">
    <h1 class="onboarding-form__title">What can we help you with first?</h1>
    <fieldset class="onboarding-form__fieldset">
      <AppFormRadio
        v-if="ddInAppSearchEnabled"
        id="Data deletion"
        :value="firstSteps"
        name="first-steps"
        @input="firstSteps = $event"
      >
        Delete my data from data brokers and the dark web
      </AppFormRadio>
      <AppFormRadio
        id="Masked information"
        :value="firstSteps"
        name="first-steps"
        @input="firstSteps = $event"
      >
        Create email and phone aliases
      </AppFormRadio>
      <AppFormRadio
        id="Communicate"
        :value="firstSteps"
        name="first-steps"
        @input="firstSteps = $event"
      >
        Privately send and receive texts and emails
      </AppFormRadio>
      <AppFormRadio
        id="Import"
        :value="firstSteps"
        name="first-steps"
        @input="firstSteps = $event"
      >
        Migrate from another password manager
      </AppFormRadio>
      <AppFormRadio
        id="Store data"
        :value="firstSteps"
        name="first-steps"
        @input="firstSteps = $event"
      >
        Store sensitive data
      </AppFormRadio>
    </fieldset>
    <footer class="onboarding-form__footer">
      <button
        type="button"
        class="onboarding-form__secondary"
        @click="emit('back')"
      >
        Back
      </button>
      <button
        type="button"
        class="onboarding-form__primary"
        @click="emit('finished')"
      >
        Go to Dashboard
        <InlineSvg name="arrow-right" />
      </button>
    </footer>
  </div>
</template>
