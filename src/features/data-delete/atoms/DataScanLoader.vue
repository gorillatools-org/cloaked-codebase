<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import InlineSvg from "@/features/InlineSvg.vue";

const ANIMATION_DURATION = 5000;

const emit = defineEmits(["complete"]);
const currentStep = ref(0);
const visibleSteps = ref(0);
const stepsHeight = ref(0);
const stepsContainer = ref(null);
const steps = [
  "Scanning data brokers",
  "Checking breach databases",
  "Analyzing password exposure",
  "Calculating threat level",
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
  const stepDuration = ANIMATION_DURATION / steps.length;

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
      }, 1000);
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
  await nextTick();
  updateHeight();
  startAnimation();
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <section class="data-scan">
    <div class="data-scan__content">
      <div class="data-scan__icon">
        <div class="data-scan__spinner">
          <InlineSvg
            name="cloaked-icon"
            class="data-scan__logo-svg"
          />
        </div>
      </div>

      <BaseText
        as="h1"
        variant="headline-2-semibold"
        class="data-scan__title"
      >
        Securely checking your data
      </BaseText>

      <div
        ref="stepsContainer"
        class="data-scan__steps"
      >
        <TransitionGroup
          name="step-fade"
          tag="div"
          class="data-scan__steps-container"
        >
          <div
            v-for="(step, index) in steps.slice(0, visibleSteps)"
            :key="index"
            class="data-scan__step"
            :class="{
              'data-scan__step--completed': index < currentStep,
              'data-scan__step--current': index === currentStep,
            }"
          >
            <div class="data-scan__step-icon">
              <BaseIcon
                v-if="index < currentStep"
                name="check"
                class="data-scan__check-icon"
              />
              <div
                v-else-if="index === currentStep"
                class="data-scan__loading-dots"
              >
                <span class="data-scan__loading-dot"></span>
                <span class="data-scan__loading-dot"></span>
                <span class="data-scan__loading-dot"></span>
              </div>
            </div>
            <BaseText
              as="p"
              variant="body-3-regular"
              class="data-scan__step-text"
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
.data-scan {
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
  z-index: 11;

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

    .data-scan__logo-svg {
      width: 60px;

      :deep(.background) {
        fill: $color-primary-100;
        opacity: 1;
      }

      :deep(.foreground) {
        fill: $color-cloaked;
        stroke: $color-cloaked;
      }
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
    height: 31px;
    width: 100%;
    transition: height 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
    position: relative;
    top: 0;
    left: 0;
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
    max-width: 260px;
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
    color: $color-cloaked;
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
    .data-scan {
      &__title {
        height: 29px;
      }

      &__content {
        transform: translateY(-61px);
      }
    }
  }

  &--animated {
    transition: none;

    .data-scan {
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
