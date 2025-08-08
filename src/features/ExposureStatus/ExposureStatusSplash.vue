<script setup>
import { computed, watch } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseOrb from "@/library/BaseOrb.vue";
import BaseButton from "@/library/BaseButton.vue";
import { useDataDeleteOverlay } from "@/routes/DataDeletion/composables/useDataDeleteOverlay";
import { posthogCapture } from "@/scripts/posthog.js";

const { openDataDeleteOverlay } = useDataDeleteOverlay();

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: true,
  },
  isEnrolled: {
    type: Boolean,
    default: false,
  },
});

const showEnrollCta = computed(() => !props.isLoading && !props.isEnrolled);

watch(showEnrollCta, (newVal) => {
  if (newVal) {
    posthogCapture("dashboard_pre_enrollment_screen");
  }
});
</script>

<template>
  <div
    class="exposure-status-splash"
    :class="{
      'exposure-status-splash--loading': isLoading,
      'exposure-status-splash--hidden': isEnrolled && !isLoading,
    }"
  >
    <div class="exposure-status-splash__container">
      <div class="exposure-status-splash__orb">
        <BaseOrb color="gold" />
      </div>

      <div
        class="exposure-status-splash__content"
        :class="{
          'exposure-status-splash__content--show-cta': showEnrollCta,
        }"
      >
        <BaseText
          variant="headline-2-regular"
          as="h2"
          class="exposure-status-splash__title exposure-status-splash__animate-item exposure-status-splash__animate-item--1"
        >
          Please Complete Data Removal Enrollment
        </BaseText>

        <BaseText
          variant="headline-6-medium"
          as="h6"
          class="exposure-status-splash__description exposure-status-splash__animate-item exposure-status-splash__animate-item--2"
        >
          There is some missing information needed to kick off exposure removal.
          Complete enrollment to begin the process.
        </BaseText>

        <BaseButton
          variant="primary"
          icon="arrow-right"
          fullWidth
          class="exposure-status-splash__animate-item exposure-status-splash__animate-item--3"
          @click="openDataDeleteOverlay"
        >
          Enroll Now
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.exposure-status-splash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: $color-primary-5;
  z-index: 5;
  transition: opacity 0.5s ease;
  padding: 24px;

  &__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    max-width: 337px;
    transition: all 0.5s ease-in-out;
  }

  &__orb {
    transition: all 0.5s ease;
    width: 210px;
    max-width: 100%;
  }

  &__content {
    text-align: center;
    max-width: 480px;
    opacity: 0;
    height: 0;
    transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 0px;

    &--show-cta {
      max-height: 500px;
      opacity: 1;
      height: auto;
      margin-top: 20px;
    }
  }

  &__animate-item {
    opacity: 0;
    transform: translateY(45px);
    transition: all 0.7s ease;

    &--1 {
      transition-delay: 0.2s;
    }

    &--2 {
      transition-delay: 0.3s;
    }

    &--3 {
      transition-delay: 0.4s;
    }
  }

  &__content--show-cta &__animate-item {
    opacity: 1;
    transform: translateY(0);
  }

  &__title {
    margin-bottom: 16px;
    color: $color-primary-100;
  }

  &__description {
    margin-bottom: 24px;
    color: $color-primary-70;
  }

  &--hidden {
    opacity: 0;
    pointer-events: none;
  }
}
</style>
