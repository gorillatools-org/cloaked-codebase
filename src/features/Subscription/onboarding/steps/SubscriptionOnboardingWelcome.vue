<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import VirtualCardsStepsTimeline from "@/features/VirtualCards/Subscription/intro/VirtualCardsStepsTimeline.vue";
import type { TimelineStepItem } from "@/features/VirtualCards/Subscription/intro/VirtualCardsStepsTimeline.vue";

const emit = defineEmits<{
  (e: "continue"): void;
}>();

const steps: TimelineStepItem[] = [
  {
    title: "Create Your Account",
    description: "Create your login and finish your security scan. ",
    duration: "Complete",
    isCompleted: true,
    icon: undefined,
  },
  {
    title: "Cloaked Pay Application",
    description: "Verify your identity to turn on your wallet.",
    duration: "Approx. 1 min",
    durationColor: "safe-zone-green",
  },
  {
    title: "Complete Your Profile",
    description:
      "We’ll remove your information from brokers and watch the dark web for you.",
    duration: "Approx. 10-15 sec",
    durationColor: "safe-zone-green",
  },
];
</script>
<template>
  <div class="subs-onboarding-welcome">
    <div class="subs-onboarding-welcome__wrapper">
      <header class="subs-onboarding-welcome__header">
        <BaseMedallion
          size="lg"
          color="spam-protection"
          icon="cloaked-logo-knock-out"
        />
        <BaseText
          variant="headline-2-semibold"
          class="subs-onboarding-welcome__title"
        >
          Welcome to Cloaked
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="subs-onboarding-welcome__description"
        >
          Finish your profile to start protecting your identity.
        </BaseText>
      </header>
      <div class="subs-onboarding-welcome__content">
        <VirtualCardsStepsTimeline
          :steps="steps"
          :initial-delay="0.3"
        >
          <template #footer>
            <footer class="subs-onboarding-welcome__footer">
              <BaseButton
                variant="primary"
                class="subs-onboarding-welcome__button"
                @click="emit('continue')"
              >
                Continue
              </BaseButton>
            </footer>
          </template>
        </VirtualCardsStepsTimeline>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.subs-onboarding-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  width: 100%;

  &__wrapper {
    width: 100%;
    padding-bottom: 24px;

    @media screen and (min-width: $screen-md) {
      width: 430px;
    }
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  &__title {
    text-align: center;
  }

  &__description {
    display: inline-flex;
    align-items: center;
    text-align: center;
    color: $color-primary-70;
  }

  &__content {
    margin-top: 24px;
    width: 100%;
  }

  &__footer {
    opacity: 1;
    max-height: 0;
    overflow: hidden;
    animation: fade-in-down 0.3s ease-out forwards;
    animation-delay: 2.1s;
  }

  &__button {
    width: 100%;
  }
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-6px);
    visibility: hidden;
    max-height: 0;
    margin-top: 0;
  }

  to {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
    max-height: 80px;
    margin-top: 24px;
  }
}
</style>
