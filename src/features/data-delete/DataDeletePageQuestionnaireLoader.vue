<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import Logo from "@/assets/icons/cloaked-logo-circle-white.svg";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_PERSONALIZED_QUESTIONS_LOADING_VIEWED } from "@/scripts/posthogEvents";
import { useIdentityTheftProtection } from "@/composables/useIdentityTheftProtection";

const props = defineProps({
  duration: {
    type: Number,
    default: 3000,
  },
  animates: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["complete"]);

const { insuranceAmountFormattedM } = useIdentityTheftProtection();
const currentStep = ref(0);
const visibleSteps = ref(0);
const stepsHeight = ref(0);
const stepsContainer = ref(null);
const steps = [
  "Stop spam with Call Guard",
  "Clean your digital footprint with Data Removal and Identity Monitoring",
  `Protect your past mistakes with ${insuranceAmountFormattedM.value} Identity Theft Insurance`,
];

let timerId;

const updateHeight = async () => {
  if (stepsContainer.value) {
    const naturalHeight = stepsContainer.value.scrollHeight;
    stepsHeight.value = naturalHeight;
    stepsContainer.value.style.height = `${naturalHeight}px`;
  }
};

const startAnimation = () => {
  const stepDuration = props.duration / steps.length;

  timerId = setInterval(() => {
    if (currentStep.value < steps.length - 1) {
      currentStep.value++;
      setTimeout(async () => {
        visibleSteps.value = currentStep.value + 1;
        await nextTick();
        updateHeight();
      }, 300);
    } else {
      currentStep.value++;
      clearInterval(timerId);
      setTimeout(() => {
        emit("complete");
      }, 500);
    }
  }, stepDuration);
};

const cleanup = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

onMounted(async () => {
  visibleSteps.value = 1;
  posthogCapture(PH_EVENT_PERSONALIZED_QUESTIONS_LOADING_VIEWED);
  await nextTick();
  updateHeight();
  startAnimation();
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <section class="questionnaire-loader">
    <div class="questionnaire-loader__content">
      <div class="questionnaire-loader__icon">
        <div class="questionnaire-loader__spinner">
          <Logo class="questionnaire-loader__logo-svg" />
        </div>
      </div>

      <BaseText
        as="h1"
        variant="headline-2-semibold"
        class="questionnaire-loader__title"
      >
        <BaseText
          as="span"
          variant="headline-2-semibold"
          class="questionnaire-loader__title__desktop"
        >
          We're creating your personalized protection plan...
        </BaseText>
        <BaseText
          as="span"
          variant="headline-2-semibold"
          class="questionnaire-loader__title__mobile"
        >
          Your Plan
        </BaseText>
      </BaseText>

      <div
        ref="stepsContainer"
        class="questionnaire-loader__steps"
      >
        <TransitionGroup
          name="step-fade"
          tag="div"
          class="questionnaire-loader__steps-container"
        >
          <div
            v-for="(step, index) in steps.slice(0, visibleSteps)"
            :key="index"
            class="questionnaire-loader__step"
            :class="{
              'questionnaire-loader__step--completed': index < currentStep,
              'questionnaire-loader__step--current': index === currentStep,
            }"
          >
            <div class="questionnaire-loader__step-icon">
              <BaseIcon
                v-if="index < currentStep"
                name="check"
                class="questionnaire-loader__check-icon"
              />
              <div
                v-else-if="index === currentStep"
                class="questionnaire-loader__loading-dots"
              >
                <span class="questionnaire-loader__loading-dot"></span>
                <span class="questionnaire-loader__loading-dot"></span>
                <span class="questionnaire-loader__loading-dot"></span>
              </div>
            </div>
            <BaseText
              as="p"
              variant="body-3-regular"
              class="questionnaire-loader__step-text"
            >
              {{ step }}
            </BaseText>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.questionnaire-loader {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100dvh;
  padding: 40px 25px;
  background: linear-gradient(
    135deg,
    rgba($color-primary-100, 0.1) 0%,
    rgba($color-spam-protection, 0.1) 100%
  );
  overflow: hidden;

  @media screen and (min-width: $screen-sm) {
    padding: 40px 20px;
    width: 450px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;

    @media screen and (min-width: $screen-lg) {
      max-width: 500px;
      padding: 40px 20px;
      gap: 20px;
    }
  }

  &__icon {
    position: relative;
    width: 120px;
    height: 120px;

    .questionnaire-loader__logo-svg {
      width: 90px;
      height: 90px;
    }
  }

  &__spinner {
    width: 100%;
    height: 100%;
    border: 3px solid $color-base-white-15-light;
    border-radius: 50%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: "";
      position: absolute;
      inset: -3px;
      border: 3px solid transparent;
      border-top-color: $color-cloaked;
      border-radius: 50%;
      animation: spin 500ms linear infinite;
    }
  }

  &__title {
    color: $white;
    text-align: center;
    margin: 0;
    font-size: 24px;
    height: 58px;
    width: 100%;
    transition: height 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
    position: relative;
    top: 0;
    left: 0;

    &__desktop {
      position: absolute;
      display: block;
      transition: opacity 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
      font-weight: 500;
      max-width: 400px;
      text-align: center;
      width: 100%;
      font-size: 24px;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    &__mobile {
      position: absolute;
      display: block;
      transition: opacity 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
      opacity: 0;
      width: 100%;
      font-weight: 700;
      font-size: 24px;
      text-align: left;

      @media screen and (min-width: $screen-lg) {
        max-width: 400px;
      }
    }
  }

  &__steps {
    padding: 12px 20px 12px 10px;
    background: $color-base-black-5-dark;
    backdrop-filter: blur(15px);
    box-shadow: 0 10px 24px 0 $color-base-black-15-light;
    border: 1px solid $color-base-black-10-dark;
    border-radius: 16px;
    width: 100%;
    overflow: hidden;
    transition: height 0.3s ease-in-out;
    height: auto;

    @media screen and (min-width: $screen-lg) {
      max-width: 378px;
    }
  }

  &__steps-container {
    display: flex;
    flex-direction: column;
  }

  &__step {
    display: grid;
    grid-template-columns: 24px 1fr;
    align-items: center;
    gap: 6px;
    padding: 3px 0;
    transition: all 0.3s ease;

    &-text {
      color: $color-primary-100;
      margin: 0;
      text-align: left;
      transition: all 0.3s ease;
    }
  }

  &__step-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__check-icon {
    color: $color-safe-zone-green;
    font-size: 16px;
  }

  &__loading-dots {
    display: flex;
    gap: 2px;
    height: 24px;
    width: 24px;
    align-items: center;
    justify-content: center;
  }

  &__loading-dot {
    width: 4px;
    height: 4px;
    background: $color-primary-100;
    border-radius: 50%;
    animation: loading-dots 1.4s ease-in-out infinite both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }

    &:nth-child(3) {
      animation-delay: 0s;
    }
  }

  &--complete {
    .questionnaire-loader {
      &__title {
        height: 29px;

        &__desktop {
          opacity: 0;
        }

        &__mobile {
          opacity: 1;
        }
      }

      &__content {
        transform: translateY(-61px);
      }
    }
  }

  &--animated {
    transition: none;

    .questionnaire-loader {
      &__content {
        transition: none;
      }

      &__spinner {
        opacity: 0;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes loading-dots {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.step-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.step-fade-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.step-fade-leave-active {
  transition: all 0.3s ease;
}

.step-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
