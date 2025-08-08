<script setup>
import { onMounted } from "vue";

import InlineSvg from "@/features/InlineSvg";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import AppModalVideo from "@/features/ui/AppModalVideo.vue";
import { PH_EVENT_USER_VIEWED_SETUPONBOARDING_MASKED_INFO_MODAL } from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";

defineEmits(["close", "back", "next"]);

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
  posthogCapture(PH_EVENT_USER_VIEWED_SETUPONBOARDING_MASKED_INFO_MODAL);
});
</script>

<template>
  <AppModalContent class="onboarding-modal__content">
    <AppModalVideo
      src="/videos/onboard_1.mp4"
      type="video/mp4"
      :autoplay="true"
      :loop="true"
      :muted="true"
      class="onboard-video"
    />
    <AppModalTitle>
      Creating masked information is your front-line defense.
    </AppModalTitle>
    <AppModalParagraph>
      Your personal phone number and email address can easily be searched on the
      internet, leaving a direct trail to you. By creating new phone numbers and
      email addresses for every scenario, you are building a privacy barrier
      against breaches, spammers and scammers.
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
        <InlineSvg name="arrow-long-right" />
      </button>
      <button
        v-else
        class="onboarding-modal__secondary-button"
        @click="$emit('close')"
      >
        Close
      </button>
    </AppModalFooter>
  </AppModalContent>
</template>
