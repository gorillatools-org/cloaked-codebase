<script lang="ts" setup>
import BaseIcon from "@/library/BaseIcon.vue";
import SubscriptionOnboardingProgressbar, {
  type SubscriptionOnboardingProgressStep,
} from "./SubscriptionOnboardingProgressbar.vue";
import { useDevice } from "@/composables/useDevice";

type Props = {
  disableBackBtn?: boolean;
  disableCloseBtn?: boolean;
  steps: SubscriptionOnboardingProgressStep[];
};

const emit = defineEmits(["back", "close"]);
const props = withDefaults(defineProps<Props>(), {
  disableBackBtn: false,
  disableCloseBtn: false,
});

const { isMobile } = useDevice();

const handleBackBtnClick = () => {
  if (props.disableBackBtn) return;
  emit("back");
};

const handleCloseBtnClick = () => {
  if (props.disableCloseBtn) return;
  emit("close");
};
</script>
<template>
  <nav class="subs-onboarding-navbar">
    <BaseIcon
      role="button"
      tabindex="0"
      aria-label="Back"
      :aria-disabled="props.disableBackBtn"
      name="chevron-left"
      class="subs-onboarding-navbar__back"
      :class="{
        'subs-onboarding-navbar__back--disabled': props.disableBackBtn,
      }"
      @click="handleBackBtnClick"
      @keydown.enter="handleBackBtnClick"
      @keydown.space.prevent="handleBackBtnClick"
    />
    <div class="subs-onboarding-navbar__progress-container">
      <SubscriptionOnboardingProgressbar
        :steps-width="isMobile ? 100 : 160"
        :steps="steps"
        class="subs-onboarding-navbar__progress"
      />
    </div>
    <BaseIcon
      role="button"
      tabindex="0"
      aria-label="Close"
      name="close"
      class="subs-onboarding-navbar__close"
      :class="{
        'subs-onboarding-navbar__close--disabled': props.disableCloseBtn,
      }"
      @click="handleCloseBtnClick"
      @keydown.enter="handleCloseBtnClick"
      @keydown.space.prevent="handleCloseBtnClick"
    />
  </nav>
</template>
<style lang="scss" scoped>
.subs-onboarding-navbar {
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 75px;
  border-bottom: 1px solid $color-primary-10;
  padding: 10px 18px;

  @media screen and (min-width: $screen-md) {
    min-height: 84px;
    padding: 14px 24px;
  }

  &__back,
  &__close {
    font-size: 20px;
    color: $color-primary-100;
    cursor: pointer;
    transition: opacity 0.12s ease-in-out;

    @media screen and (min-width: $screen-md) {
      font-size: 24px;
    }

    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(&--disabled) {
      opacity: 0.7;
    }
  }

  &__progress {
    transform: scale(0.9);

    @media screen and (min-width: $screen-md) {
      transform: scale(1);
    }
  }
}
</style>
