<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { computed } from "vue";

export type SubscriptionOnboardingProgressStepStatus =
  | "active"
  | "completed"
  | "pending";

export type SubscriptionOnboardingProgressStep = {
  id: string;
  label: string;
  status: SubscriptionOnboardingProgressStepStatus;
  visible?: boolean;
};

type SubscriptionOnboardingProgressbarProps = {
  steps: SubscriptionOnboardingProgressStep[];
  stepsWidth: number;
};

const props = defineProps<SubscriptionOnboardingProgressbarProps>();

const visibleSteps = computed(() => {
  return props.steps.filter((step) => step.visible !== false);
});

const progressBarWidth = computed(() => {
  const nonPendingStepsAmount = visibleSteps.value.filter(
    (step) => step.status !== "pending"
  ).length;
  return `calc(${(nonPendingStepsAmount - 1) * props.stepsWidth}px)`;
});

const progressBarLeftGradientPercent = computed(() => {
  const completedStepsLength = visibleSteps.value.filter(
    (step) => step.status === "completed"
  ).length;
  const activeStepsLength = visibleSteps.value.filter(
    (step) => step.status === "active"
  ).length;

  const percent =
    (completedStepsLength / (completedStepsLength + activeStepsLength)) * 100;

  return `${percent || 0}%`;
});
</script>
<template>
  <div
    class="subs-onboarding-progressbar"
    :style="{
      '--progress-bar-width': progressBarWidth,
      '--steps-width': props.stepsWidth + 'px',
      '--progress-bar-left-gradient-percent': progressBarLeftGradientPercent,
    }"
  >
    <div class="subs-onboarding-progressbar__progress-bar"></div>
    <div class="subs-onboarding-progressbar__steps">
      <div
        v-for="step in visibleSteps"
        :key="step.id"
        class="subs-onboarding-progressbar__step"
        :class="`subs-onboarding-progressbar__step--${step.status}`"
      >
        <div class="subs-onboarding-progressbar__step-circle-container">
          <div class="subs-onboarding-progressbar__step-circle">
            <Transition
              name="fade"
              mode="out-in"
            >
              <BaseIcon
                v-if="step.status === 'completed'"
                class="subs-onboarding-progressbar__step-circle-icon"
                name="check"
              />
            </Transition>
          </div>
          <BaseText
            variant="body-small-semibold"
            class="subs-onboarding-progressbar__step-circle-label"
          >
            {{ step.label }}
          </BaseText>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$transition: cubic-bezier(0.77, 0, 0.18, 1);

@property --progress-bar-left-gradient-percent {
  syntax: "<percentage>";
  inherits: true;
  initial-value: 0%;
}

.subs-onboarding-progressbar {
  width: 100%;
  position: relative;

  &__progress-bar {
    width: var(--progress-bar-width);
    height: 4px;
    top: 10px;
    left: calc(var(--steps-width) / 2);
    position: absolute;
    transition:
      width 0.38s $transition,
      --progress-bar-left-gradient-percent 0.38s $transition;
    background: #000;
    background: linear-gradient(
      90deg,
      $color-spam-protection var(--progress-bar-left-gradient-percent),
      $color-primary-100 100%
    );
  }

  &__steps {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__step {
    width: var(--steps-width);

    &-circle {
      width: 22px;
      height: 22px;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid $color-primary-50;
      background: $color-base-white-100;
      transition:
        background 0.4s $transition,
        border 0.4s $transition;

      .subs-onboarding-progressbar__step--completed & {
        background: $color-spam-protection;
        border: 1px solid $color-spam-protection;
      }

      .subs-onboarding-progressbar__step--active & {
        background: $color-primary-100;
        border: 1px solid $color-primary-100;
      }

      &-icon {
        color: $color-white;
      }

      &-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      &-label {
        color: $color-primary-50;
        transition: color 0.4s $transition;

        .subs-onboarding-progressbar__step--active & {
          color: $color-primary-100;
        }

        .subs-onboarding-progressbar__step--completed:last-child & {
          color: $color-spam-protection;
        }
      }
    }
  }
}
</style>
