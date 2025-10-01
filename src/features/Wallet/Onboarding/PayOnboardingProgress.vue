<script setup lang="ts">
import { defineProps } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import CloakedLogoIcon from "@/assets/images/CloakedLogoIcon.svg";

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
    <BaseIcon
      name="close"
      class="pay-onboarding-progress__icon pay-onboarding-progress__icon-close"
      @click="emit('close')"
    />
  </div>
</template>
<style scoped lang="scss">
$component-name: "pay-onboarding-progress";

.#{$component-name} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  padding: 20px;

  @media all and (min-width: $screen-sm) {
    gap: 60px;
    padding: 24px;
  }

  &__logo {
    display: none;

    @media all and (min-width: $screen-sm) {
      width: 44px;
      height: auto;
      color: $color-primary-100;
      display: block;
    }
  }

  &__icon-close {
    font-size: 20px;
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 0.7;
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
