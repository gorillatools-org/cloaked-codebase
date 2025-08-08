<script setup>
import AppFormRadio from "@/features/AppFormRadio.vue";
import { computed, onMounted } from "vue";
import { PH_EVENT_USER_VIEWED_SETUPONBOARDING_EMAIL_FORWARDING } from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["input", "back", "next"]);
const forwardEmail = computed({
  get: () => props.value.forwardEmail,
  set: (value) => emit("input", { ...props.value, forwardEmail: value }),
});

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_SETUPONBOARDING_EMAIL_FORWARDING);
});
</script>

<template>
  <div class="onboarding-form__content">
    <h1 class="onboarding-form__title">
      Would you like to forward incoming emails?
    </h1>
    <p class="onboarding-form__text">
      Emails received by one of your Cloaked emails can auto-forward to your
      personal email, protecting your real identity.
    </p>
    <fieldset class="onboarding-form__fieldset">
      <AppFormRadio
        id="Yes"
        :value="forwardEmail"
        name="email-forwarding"
        @input="forwardEmail = $event"
      >
        Yes
      </AppFormRadio>
      <AppFormRadio
        id="Not now"
        :value="forwardEmail"
        name="email-forwarding"
        @input="forwardEmail = $event"
      >
        Not now
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
        @click="emit('next')"
      >
        Next
        <InlineSvg name="arrow-right" />
      </button>
    </footer>
  </div>
</template>
