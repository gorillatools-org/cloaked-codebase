<script setup>
import { onMounted } from "vue";

import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import AppModalVideo from "@/features/ui/AppModalVideo.vue";
import { PH_EVENT_USER_VIEWED_SETUPONBOARDING_PRIVATE_ACTIVITY_MODAL } from "@/scripts/posthogEvents";
import InlineSvg from "@/features/InlineSvg";
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
  posthogCapture(PH_EVENT_USER_VIEWED_SETUPONBOARDING_PRIVATE_ACTIVITY_MODAL);
});
</script>

<template>
  <AppModalContent class="onboarding-modal__content">
    <AppModalVideo
      src="/videos/onboard_2.mp4"
      type="video/mp4"
      :autoplay="true"
      :loop="true"
      :muted="true"
    />
    <AppModalTitle>
      Privately send and receive encrypted texts and emails.
    </AppModalTitle>
    <AppModalParagraph>
      All phone numbers and email addresses have their own individualized
      inboxes, located inside of an Identity. Texts, calls and emails received
      to one of your identities can auto-forward to your personal device,
      protecting your real identity.
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
