<script setup>
import OnboardingPageHeader from "@/features/onboarding/page/OnboardingPageHeader.vue";
import OnboardingForm from "@/features/onboarding/page/OnboardingForm.vue";
import {
  STEP_VERIFY_EMAIL,
  STEP_PHONE_2FA,
  STEP_FIRST_STEPS,
  STEP_FORWARDING_EMAIL,
  STEP_FORWARDING_PHONE,
  ONBOARDING_FORM_STEPS,
} from "@/features/onboarding/page/utils";
import { ref } from "vue";
import { assetUrl } from "@/scripts/assets";

defineEmits(["input"]);

const step = ref(ONBOARDING_FORM_STEPS[0]);

const stepToBackgroundImage = {
  [STEP_FORWARDING_EMAIL]: "@/assets/images/onboarding/onboarding-1.webp",
  [STEP_VERIFY_EMAIL]: "@/assets/images/onboarding/onboarding-1.webp",
  [STEP_PHONE_2FA]: "@/assets/images/onboarding/onboarding-2.webp",
  [STEP_FORWARDING_PHONE]: "@/assets/images/onboarding/onboarding-3.webp",
  [STEP_FIRST_STEPS]: "@/assets/images/onboarding/onboarding-4.webp",
};
</script>

<template>
  <div class="onboarding-page">
    <OnboardingPageHeader />
    <OnboardingForm
      :step="step"
      v-bind="$attrs"
      :value="$attrs.value"
      class="onboarding-page__form"
      @set-step="step = $event"
      @input="$emit('input', $event)"
    />
    <img
      :src="
        assetUrl(
          stepToBackgroundImage[step] ??
            '@/assets/images/onboarding/onboarding-4.webp'
        )
      "
      width="1200"
      height="720"
      alt="Cloaked Hero"
      class="onboarding-page__background"
    />
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.onboarding-page {
  display: grid;
  padding: 20px;
  gap: 30px;
  position: relative;
  max-width: 1650px;
  margin: auto;

  @media (min-width: $screen-xl) {
    padding: 40px;
    display: grid;
    gap: 40px;
    grid-template-columns: minmax(400px, 1fr) minmax(300px, 650px);
    grid-template-rows: minmax(min-content, calc(100vh - 80px));
    align-items: start;
    justify-content: start;
  }

  &__background {
    display: none;

    @media (min-width: $screen-xl) {
      display: block;
      z-index: -1;
      margin: 0;
      position: absolute;
      inset: clamp(130px, 25vh, 200px) 0 0 -180px;
      filter: drop-shadow(0 450px 240px rgb(0 0 0 / 15%));
    }
  }
}
</style>
