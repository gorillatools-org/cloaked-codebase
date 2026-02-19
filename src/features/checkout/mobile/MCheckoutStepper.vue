<script setup lang="ts">
import { nextTick, readonly, ref, watch } from "vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";

export type MobileCheckoutStepStatus = "pending" | "active" | "completed";

export type MobileCheckoutStepId =
  | "plan"
  | "protection"
  | "account"
  | "payment";

export type MobileCheckoutStep = {
  id: MobileCheckoutStepId;
  title: string;
  subtitle?: string;
  optional?: boolean;
  completedTitle?: string;
  completedSubtitle?: string;
  completedActionLabel?: string;
};

type Props = {
  disabledSteps?: MobileCheckoutStepId[];
  hiddenSteps?: MobileCheckoutStepId[];
};

const props = withDefaults(defineProps<Props>(), {
  disabledSteps: () => [],
  hiddenSteps: () => [],
});

const emit = defineEmits<{
  (e: "step-action", stepId: MobileCheckoutStepId): void;
}>();

const SCROLL_PADDING = 56;
const LAYOUT_SETTLE_MS = 180;

const activeStepId = ref<MobileCheckoutStepId>("plan");
const completedSteps = ref(new Set<MobileCheckoutStepId>());

const stepRefs = ref<Record<string, HTMLElement | null>>({});

const steps = ref<MobileCheckoutStep[]>([
  {
    id: "plan",
    title: "Choose Your Plan",
    completedActionLabel: "Change",
  },
  {
    id: "protection",
    title: "Add People to Your Plan",
    subtitle: "Protect up to 3 more people",
    completedActionLabel: "Change",
    optional: true,
  },
  {
    id: "account",
    title: "Create Your Account",
    subtitle: "Confirm your details to get started",
    completedActionLabel: "Change",
  },
  {
    id: "payment",
    title: "Payment",
    subtitle: "Enter payment details to proceed",
    completedActionLabel: "Change",
  },
]);

const setStepRef = (id: string, el: HTMLElement | null) => {
  stepRefs.value[id] = el;
};

const getStepStatus = (step: MobileCheckoutStep): MobileCheckoutStepStatus => {
  if (step.id === activeStepId.value) {
    return "active";
  }

  if (completedSteps.value.has(step.id)) {
    return "completed";
  }

  return "pending";
};

const getStepSubtitle = (step: MobileCheckoutStep): string | undefined => {
  if (getStepStatus(step) === "completed") {
    return step.completedSubtitle ?? step.subtitle;
  }

  return step.subtitle;
};

const nextStep = async (milliseconds = 0): Promise<void> => {
  const currentIndex = steps.value.findIndex(
    (step) => step.id === activeStepId.value
  );

  if (currentIndex === -1) {
    return;
  }

  const nextStep = steps.value.find(
    (step, index) =>
      index > currentIndex &&
      !completedSteps.value.has(step.id) &&
      !isStepHidden(step.id)
  );

  if (!nextStep) {
    return;
  }

  if (milliseconds > 0) {
    await wait(milliseconds);
  }

  completedSteps.value.add(activeStepId.value);
  goToStep(nextStep.id);
};

const goToStep = (stepId: MobileCheckoutStepId) => {
  if (isStepHidden(stepId)) {
    throw new Error(`Step ${stepId} is not available`);
  }

  activeStepId.value = stepId;
};

const updateStepCompletedMeta = async (
  stepId: MobileCheckoutStepId,
  meta: Partial<
    Pick<MobileCheckoutStep, "completedTitle" | "completedSubtitle">
  >,
  milliseconds = 150
): Promise<void> => {
  const step = steps.value.find((step) => step.id === stepId);

  if (!step) {
    return;
  }

  if (milliseconds > 0) {
    await wait(milliseconds);
  }

  if (meta.completedTitle !== undefined) {
    step.completedTitle = meta.completedTitle;
  }

  if (meta.completedSubtitle !== undefined) {
    step.completedSubtitle = meta.completedSubtitle;
  }
};

const isStepDisabled = (stepId: MobileCheckoutStepId): boolean => {
  return props.disabledSteps.includes(stepId);
};

const isStepHidden = (stepId: MobileCheckoutStepId): boolean => {
  return props.hiddenSteps.includes(stepId);
};

const wait = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

watch(activeStepId, async (id) => {
  await nextTick();

  const firstStepId = steps.value[0]?.id;

  if (id === firstStepId) {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, LAYOUT_SETTLE_MS);
    return;
  }

  // Measure and scroll after the layout animations have settled
  setTimeout(() => {
    const el = stepRefs.value[id];
    if (!el) return;

    const header = document.querySelector("#mobile-checkout-header");
    const headerHeight = header ? header.getBoundingClientRect().height : 0;

    const rect = el.getBoundingClientRect();
    const offset = headerHeight + SCROLL_PADDING;
    const targetY = window.scrollY + rect.top - offset;

    const headerBottom = rect.top + rect.height;
    const viewportBottom = window.innerHeight;

    // Skip scroll if the step header is already comfortably in view
    if (rect.top >= offset && headerBottom <= viewportBottom) {
      return;
    }

    window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }, LAYOUT_SETTLE_MS);
});

defineExpose({
  steps: readonly(steps),
  activeStepId,
  nextStep,
  goToStep,
  updateStepCompletedMeta,
});
</script>

<template>
  <div class="checkout-stepper">
    <div class="checkout-stepper__steps">
      <slot name="steps-header" />
      <div
        v-for="step in steps"
        v-show="!isStepHidden(step.id)"
        :key="step.id"
        :ref="(el) => setStepRef(step.id, el as HTMLElement | null)"
        class="checkout-stepper__step"
        :class="{
          'checkout-stepper__step--active': getStepStatus(step) === 'active',
          'checkout-stepper__step--completed':
            getStepStatus(step) === 'completed',
          'checkout-stepper__step--pending': getStepStatus(step) === 'pending',
          'checkout-stepper__step--disabled': isStepDisabled(step.id),
        }"
      >
        <div class="checkout-stepper__step-progress">
          <div class="checkout-stepper__step-progress-indicator">
            <div class="checkout-stepper__step-progress-indicator-dot" />
            <BaseIcon
              name="check"
              class="checkout-stepper__step-progress-indicator-icon"
            />
          </div>
          <div class="checkout-stepper__step-progress-line" />
        </div>
        <div class="checkout-stepper__step-main">
          <header class="checkout-stepper__step-header">
            <div class="checkout-stepper__step-header-row">
              <BaseText
                variant="title-3-emphasized"
                class="checkout-stepper__step-header-title"
              >
                {{ step.completedTitle || step.title }}
              </BaseText>
              <Transition
                name="action-fade"
                mode="out-in"
              >
                <button
                  v-if="
                    getStepStatus(step) === 'completed' &&
                    !isStepDisabled(step.id) &&
                    step.completedActionLabel
                  "
                  key="action"
                  class="checkout-stepper__step-action"
                  @click="emit('step-action', step.id)"
                >
                  <BaseText variant="caption-1-emphasized">
                    {{ step.completedActionLabel }}
                  </BaseText>
                </button>
                <div
                  v-else-if="
                    getStepStatus(step) === 'active' &&
                    $slots[`${step.id}-header-action`]
                  "
                  key="slot-action"
                >
                  <slot
                    :name="`${step.id}-header-action`"
                    :step="step"
                  />
                </div>
                <BaseText
                  v-else-if="step.optional"
                  key="optional"
                  variant="footnote-regular"
                  class="checkout-stepper__step-header-optional"
                >
                  (optional)
                </BaseText>
              </Transition>
            </div>
            <div class="checkout-stepper__step-header-subtitle-container">
              <Transition name="subtitle-fade">
                <BaseText
                  v-if="getStepSubtitle(step)"
                  :key="getStepSubtitle(step)"
                  variant="footnote-regular"
                  class="checkout-stepper__step-header-subtitle"
                >
                  {{ getStepSubtitle(step) }}
                </BaseText>
              </Transition>
            </div>
          </header>

          <!-- Step content (only rendered for active step) -->
          <div class="checkout-stepper__step-content">
            <div class="checkout-stepper__step-content-inner">
              <slot
                :name="step.id"
                :step="step"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); // overshoot bounce
$ease-decelerate: cubic-bezier(0, 0, 0.2, 1); // fast start, slow end (expand)
$ease-standard: cubic-bezier(0.4, 0, 0.6, 1); // balanced (collapse)

.checkout-stepper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: $color-surface-l1;
  padding: 24px 16px;

  &__steps {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__step {
    display: flex;
    gap: 8px;
    transition: opacity 0.3s ease-out;

    &--disabled {
      opacity: 0.4;
      pointer-events: none;
    }

    &-progress {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;

      &-indicator {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid $color-neutral-200;
        flex-shrink: 0;
        transition:
          border-color 0.25s ease,
          background-color 0.25s ease;

        .checkout-stepper__step--active & {
          border-color: $color-brand-300;
          background-color: $color-brand-300;
        }

        .checkout-stepper__step--completed & {
          border-color: $color-brand-200;
          background-color: $color-brand-200;
        }

        &-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          background-color: $color-white;
          opacity: 0;
          transform: scale(0);

          // Closing: fast scale-down
          transition:
            opacity 0.15s ease,
            transform 0.15s ease;

          .checkout-stepper__step--active & {
            opacity: 1;
            transform: scale(1);

            // Opening: spring overshoot
            transition:
              opacity 0.15s ease,
              transform 0.25s $ease-spring;
          }
        }

        &-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          font-size: 15px;
          font-weight: 600;
          color: $color-brand-300;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0);

          // Closing: fast scale-down
          transition:
            opacity 0.15s ease,
            transform 0.15s ease;

          .checkout-stepper__step--completed & {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);

            // Opening: spring overshoot, slight delay for dot to exit first
            transition:
              opacity 0.15s 0.03s ease,
              transform 0.3s 0.03s $ease-spring;
          }
        }
      }

      &-line {
        width: 2px;
        flex: 1;
        background-color: $color-neutral-200;
        transition: background-color 0.35s ease-out;

        .checkout-stepper__step--active &,
        .checkout-stepper__step--completed & {
          background-color: $color-brand-200;
        }

        .checkout-stepper__step:last-child & {
          display: none;
        }
      }
    }

    &-main {
      position: relative;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      padding-bottom: 24px;

      &::after {
        content: "";
        position: absolute;
        bottom: 24px;
        left: 0;
        min-width: 100%;
        min-height: 1px;
        background-color: $color-overlay-neutral-10;
      }

      .checkout-stepper__step:last-child & {
        &::after {
          display: none;
        }
      }
    }

    &-header {
      display: flex;
      flex-direction: column;

      &-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 8px;
      }

      &-title {
        flex: 1;
        min-width: 0;
      }

      &-subtitle {
        color: $color-neutral-500;
      }

      &-optional {
        flex-shrink: 0;
        color: $color-neutral-400;
      }

      &-subtitle-container {
        position: relative;
        min-height: 18px;
      }
    }

    &-action {
      border-radius: 100px;
      background: transparent;
      cursor: pointer;
      padding: 3px 8px;
      border: 1px solid $color-neutral-200;
      flex-shrink: 0;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
        pointer-events: none;
      }
    }

    &-content {
      display: grid;
      grid-template-rows: 0fr;
      overflow: hidden;

      // Close transition
      transition: grid-template-rows 0.2s $ease-standard;

      .checkout-stepper__step--active & {
        grid-template-rows: 1fr;

        // Open transition
        transition: grid-template-rows 0.3s $ease-decelerate;
      }
    }

    &-content-inner {
      min-height: 0; // Required for Safari/iOS WebKit to properly collapse 0fr grid tracks
      overflow: hidden;
      opacity: 0;
      filter: blur(3px);
      padding-top: 24px;
      padding-bottom: 0;
      transform: translateY(8px);

      // Close transition
      transition:
        opacity 0.25s ease-out,
        transform 0.2s ease-out,
        filter 0.2s ease-out,
        padding-top 0.2s 0.08s $ease-standard,
        padding-bottom 0.2s 0.08s $ease-standard;

      .checkout-stepper__step--active & {
        opacity: 1;
        padding-top: 16px;
        padding-bottom: 24px;
        transform: translateY(0);
        filter: blur(0);

        // Open transition
        transition:
          opacity 0.25s 0.1s ease-out,
          filter 0.4s $ease-decelerate,
          transform 0.3s 0.08s $ease-decelerate,
          padding-top 0.38s $ease-decelerate,
          padding-bottom 0.38s $ease-decelerate;
      }
    }
  }
}

.subtitle-fade-enter-active {
  transition:
    opacity 0.2s 0.26s ease-out,
    transform 0.2s 0.26s $ease-decelerate;
}

.subtitle-fade-leave-active {
  position: absolute;
  transform: translateY(2px);
  width: 100%;
  transition: opacity 0.15s ease-out;
}

.subtitle-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.subtitle-fade-leave-to {
  opacity: 0;
}

.action-fade-enter-active {
  transition: opacity 0.5s 0.15s ease-out;
}

.action-fade-leave-active {
  transition: opacity 0.1s ease-out;
}

.action-fade-enter-from,
.action-fade-leave-to {
  opacity: 0;
}
</style>
