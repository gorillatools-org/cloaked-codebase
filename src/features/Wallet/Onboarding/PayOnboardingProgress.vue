<script setup lang="ts">
import { defineProps } from "vue";
import BaseButton from "@/library/BaseButton.vue";
import CloakedLogoIcon from "@/assets/icons/cloaked-logo-full.svg";

const emit = defineEmits<{
  (e: "close"): void;
}>();

defineProps({
  progress: {
    type: Number,
    default: 0,
  },
});
</script>
<template>
  <div class="pay-onboarding-progress">
    <CloakedLogoIcon class="pay-onboarding-progress__logo" />
    <div class="pay-onboarding-progress__bar">
      <div
        class="pay-onboarding-progress__bar-progress"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
    <BaseButton
      variant="text"
      class="pay-onboarding-progress__skip-button"
      @click="emit('close')"
    >
      Skip
    </BaseButton>
  </div>
</template>
<style scoped lang="scss">
$component-name: "pay-onboarding-progress";

.#{$component-name} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20px;

  @media all and (min-width: $screen-sm) {
    padding: 24px;
  }

  &__logo {
    display: none;
    margin-right: 24px;

    @media all and (min-width: $screen-md) {
      width: 94px;
      min-width: 94px;
      height: auto;
      color: $color-primary-100;
      display: block;
      margin-right: 60px;
    }
  }

  &__skip-button {
    flex-shrink: 0;
    margin-left: 10px;

    @media all and (min-width: $screen-sm) {
      margin-left: 40px;
    }
  }

  &__bar {
    width: 100%;
    flex-grow: 1;
    height: 6px;
    border-radius: 10px;
    background-color: $color-base-black-15;

    &-progress {
      height: 100%;
      border-radius: 10px;
      background-color: $color-primary-100;
      max-width: 100%;
      transition: width 0.2s ease-in-out;
    }
  }
}
</style>
