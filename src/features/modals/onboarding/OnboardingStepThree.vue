<script setup>
import { onMounted } from "vue";

import InlineSvg from "@/features/InlineSvg";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import AppModalVideo from "@/features/ui/AppModalVideo.vue";
import { PH_EVENT_USER_VIEWED_SETUPONBOARDING_MIGRATE } from "@/scripts/posthogEvents";
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
  posthogCapture(PH_EVENT_USER_VIEWED_SETUPONBOARDING_MIGRATE);
});
</script>

<template>
  <AppModalContent class="onboarding-modal__content">
    <AppModalVideo
      src="/videos/importer-getting-started.mp4"
      type="video/mp4"
      :autoplay="true"
      :loop="true"
      :muted="true"
    />
    <AppModalTitle>
      Securely migrate from another password manager.
    </AppModalTitle>
    <AppModalParagraph>
      Cloaked is a world-class password manager. Migrating from another password
      manager is as simple as exporting a CSV and importing right into Cloaked.
      We will automatically parse all of the data into individual Identities.
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
      <div class="action-buttons">
        <router-link
          to="/import"
          class="cta-button"
          @click="$emit('close')"
        >
          Launch Importer
        </router-link>
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
      </div>
    </AppModalFooter>
  </AppModalContent>
</template>

<style scoped lang="scss">
.action-buttons {
  gap: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cta-button {
  padding: 20px 30px;
  align-items: center;
  border-radius: 100px;
  color: $color-primary-100;
  background-color: transparent;
  justify-content: space-between;
  border: 2px solid $color-primary-100;
  font-family: $global-font;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;

  &:hover {
    opacity: 0.8;
  }
}
</style>
