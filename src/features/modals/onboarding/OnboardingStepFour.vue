<script setup>
import { onMounted } from "vue";

import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import AppModalVideo from "@/features/ui/AppModalVideo.vue";
import { PH_EVENT_USER_VIEWED_SETUPONBOARDING_SENSITIVE_DATA } from "@/scripts/posthogEvents";
import inlineSvg from "@/features/InlineSvg";
import { posthogCapture } from "@/scripts/posthog.js";

defineEmits(["close", "back", "next", "finished"]);

defineProps({
  step: {
    type: Number,
    default: 0,
  },
  nextStep: {
    type: String,
    default: null,
  },
});

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_SETUPONBOARDING_SENSITIVE_DATA);
});
</script>

<template>
  <AppModalContent class="onboarding-modal__content">
    <AppModalVideo
      src="/videos/onboard_4.mp4"
      type="video/mp4"
      :autoplay="true"
      :loop="true"
      :muted="true"
    />
    <AppModalTitle>Store sensitive data and use it anywhere.</AppModalTitle>
    <AppModalParagraph>
      Not only do Cloaked Identities store phone numbers, emails, passwords, and
      usernames, they also securely house your one-time passcodes, secure notes,
      as well as custom fields.
    </AppModalParagraph>
    <AppModalFooter class="onboarding-modal__footer">
      <button
        v-if="step === 0"
        class="onboarding-modal__tertiary-button"
        @click="$emit('close')"
      >
        Skip
      </button>
      <button
        v-else
        class="onboarding-modal__tertiary-button"
        @click="$emit('back')"
      >
        Back
      </button>
      <button
        v-if="nextStep"
        class="onboarding-modal__primary-button"
        @click="$emit('next')"
      >
        Next: {{ nextStep }}
        <inlineSvg name="arrow-long-right" />
      </button>
      <button
        v-else
        class="onboarding-modal__secondary-button"
        @click="$emit('finished')"
      >
        Close
      </button>
    </AppModalFooter>
  </AppModalContent>
</template>
