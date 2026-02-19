<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { computed, onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import VirtualCardsStepsTimeline, {
  type TimelineStepItem,
} from "./VirtualCardsStepsTimeline.vue";
import store from "@/store";

const emit = defineEmits<{
  (e: "continue"): void;
}>();

onMounted(() => {
  posthogCapture("pay_kyc_intro_application_steps_screenview");
});

const isSubscribedToCloakedPay = computed(() => {
  return (
    store.state.authentication?.user?.cloaked_card_enabled_status === "new"
  );
});

const steps = computed<TimelineStepItem[]>(() => {
  const steps: TimelineStepItem[] = isSubscribedToCloakedPay.value
    ? [
        {
          title: "Confirm your plan",
          description: "Create your login and finish your security scan",
          duration: "Complete",
          isCompleted: true,
          durationColor: "safe-zone-green",
        },
      ]
    : [
        {
          title: "Confirm your plan",
          description: "You'll only be charged after verification.",
          duration: "Approx. 30 sec",
          durationColor: "spam-protection",
        },
      ];

  return [
    ...steps,
    {
      title: "Verify your identity",
      description: "Confirm your personal details.",
      duration: "Approx. 1 min",
      durationColor: "spam-protection",
    },
    {
      title: "Start transacting",
      description:
        "If you're verified, start creating Virtual Cards and secure your payments.",
      duration: "Approx. 30 sec",
      icon: "card-pos",
      durationColor: "spam-protection",
    },
  ];
});

const handleContinue = () => {
  posthogCapture("pay_kyc_intro_application_steps_upgrade_tapped");
  emit("continue");
};
</script>

<template>
  <div class="vc-subs-intro-step-2">
    <header class="vc-subs-intro-step-2__header">
      <BaseMedallion
        size="lg"
        color="spam-protection"
        icon="wallet-filled"
      />
      <BaseText
        variant="headline-2-semibold"
        class="vc-subs-intro-step-2__title"
      >
        Start your application
      </BaseText>
      <BaseText
        variant="headline-5-bold"
        class="vc-subs-intro-step-2__description"
      >
        Apply for Cloaked Pay in {{ steps.length }} easy steps.
      </BaseText>
    </header>

    <div class="vc-subs-intro-step-2__content">
      <VirtualCardsStepsTimeline :steps="steps" />

      <BaseButton
        variant="primary"
        class="vc-subs-intro-step-2__button"
        @click="handleContinue"
      >
        {{ isSubscribedToCloakedPay ? "Start application" : "Continue" }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vc-subs-intro-step-2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding-bottom: 40px;

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__title {
    text-align: center;
    margin-top: 13px;
  }

  &__description {
    text-align: center;
    font-weight: 400;
    margin-top: 8px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 345px;
  }

  &__button {
    margin-top: 24px;
    width: 100%;
    z-index: 2;
    opacity: 0;
    visibility: hidden;
    animation: fade-in-down 0.34s ease-out forwards;
    animation-delay: 1.8s;
  }
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-6px);
    visibility: hidden;
  }

  to {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
  }
}
</style>
