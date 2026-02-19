<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import CreditCardBlack from "@/assets/images/pay-onboarding/credit-card-black.png";
import CreditCardWhite from "@/assets/images/pay-onboarding/credit-card-white.png";
import ConfettiExplosion from "@/features/ConfettiExplosion.vue";
import { posthogCapture } from "@/scripts/posthog";
import { ref, onBeforeMount } from "vue";
import { useDevice } from "@/composables/useDevice";

type Props = {
  title?: string;
  description?: string;
  btnBackgroundColor?: string;
  btnText?: string;
  btnEvent?: string | null;
  secondaryBtnText?: string;
};

const emit = defineEmits<{
  (e: "continue"): void;
  (e: "secondary-btn-click"): void;
}>();

const props = withDefaults(defineProps<Props>(), {
  title: "You're approved for Cloaked Pay",
  description:
    "In just a few minutes, link your funding source to create your first card.",
  btnBackgroundColor: "purple-gradient",
  btnText: "Set Up Your First Card",
  btnEvent: "pay_post_kyc_onboarding_setup_card_tapped",
  secondaryBtnText: undefined,
});

const { isMobile } = useDevice();

const isLeaving = ref(false);

// Preload images to ensure they're ready before rendering
onBeforeMount(() => {
  const preloadImage = (src: string) => {
    const img = new Image();
    img.src = src;
  };

  preloadImage(CreditCardBlack);
  preloadImage(CreditCardWhite);
});

const handleSetupBtnClick = () => {
  isLeaving.value = true;
  setTimeout(() => {
    if (props.btnEvent !== null && !!props.btnEvent) {
      posthogCapture(props.btnEvent);
    }
    emit("continue");
  }, 300);
};

const handleSecondaryBtnClick = () => {
  isLeaving.value = true;
  setTimeout(() => {
    emit("secondary-btn-click");
  }, 300);
};
</script>
<template>
  <div
    class="pay-onboarding-welcome-step-1"
    :class="{ 'pay-onboarding-welcome-step-1--leaving': isLeaving }"
  >
    <BaseMedallion
      size="lg"
      color="primary-adaptative"
      icon="check"
    />
    <BaseText
      variant="headline-2-semibold"
      class="pay-onboarding-welcome-step-1__title"
    >
      {{ title }}
    </BaseText>
    <BaseText
      variant="headline-6-medium"
      class="pay-onboarding-welcome-step-1__description"
    >
      {{ description }}
    </BaseText>
    <BaseButton
      variant="primary"
      :background-color="btnBackgroundColor"
      class="pay-onboarding-welcome-step-1__button"
      @click="handleSetupBtnClick"
    >
      {{ btnText }}
    </BaseButton>
    <BaseButton
      v-if="secondaryBtnText"
      variant="secondary"
      class="pay-onboarding-welcome-step-1__button pay-onboarding-welcome-step-1__button--secondary"
      @click="handleSecondaryBtnClick"
    >
      {{ secondaryBtnText }}
    </BaseButton>
    <div class="pay-onboarding-welcome-step-1__animated-container">
      <div class="pay-onboarding-welcome-step-1__animated-card-black">
        <img
          :src="CreditCardBlack"
          alt="Credit Card Black"
        />
      </div>
      <div class="pay-onboarding-welcome-step-1__animated-card-white">
        <img
          :src="CreditCardWhite"
          alt="Credit Card White"
        />
      </div>
    </div>
    <div class="pay-onboarding-welcome-step-1__confetti-container">
      <ConfettiExplosion
        class="pay-onboarding-welcome-step-1__confetti pay-onboarding-welcome-step-1__confetti--left"
        :particle-count="isMobile ? 70 : 100"
        :delay="isMobile ? 1000 : 600"
      />
      <ConfettiExplosion
        class="pay-onboarding-welcome-step-1__confetti pay-onboarding-welcome-step-1__confetti--right"
        :particle-count="isMobile ? 70 : 100"
        :delay="isMobile ? 1000 : 600"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
$component-name: "pay-onboarding-welcome-step-1";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  position: relative;
  overflow: hidden;
  padding-inline: 16px;

  @media screen and (min-width: $screen-md) {
    padding-inline: 0;
  }

  &__title {
    text-align: center;

    @media all and (width < $screen-sm) {
      font-size: 29px;
    }
  }

  &__description {
    text-align: center;
  }

  &__button {
    width: 345px;
    margin-top: 24px;
    position: relative;
    z-index: 2;
  }

  &__button--secondary {
    width: 345px;
    margin-top: 8px;
  }

  &__confetti {
    position: absolute;
    width: 100%;
    top: 0;

    &-container {
      width: 100%;
    }

    &--left {
      left: 0;
    }

    &--right {
      left: 100%;
    }
  }

  &__animated {
    &-container {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      flex-grow: 1;
      height: 100%;
      position: relative;
      width: 100%;
      transform: translateY(10px);
      z-index: 1;

      &::before {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%) translateY(45%);
        width: 40vw;
        height: 100%;
        border-radius: 50%;
        transform-origin: bottom left;
        filter: blur(72.02px);
        animation: scale-fade-in 0.5s ease-out;

        @at-root .theme-dark & {
          background: rgba($color-base-black-100-dark, 0.15);
        }

        @at-root .theme-light & {
          background: rgba($color-base-black-100-light, 0.2);
        }

        .#{$component-name}--leaving & {
          animation: scale-fade-out 0.4s cubic-bezier(1, 0, 0, 1) forwards;
          animation-delay: 0.1s;
        }
      }
    }

    &-card-black {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      left: 50%;
      width: 420px;
      transform: translateX(-300px);
      z-index: 0;

      img {
        width: 250px;
        animation: card-entrance 0.5s cubic-bezier(0.66, 0, 0.07, 1) forwards;
        transition-delay: 0.9s;

        .#{$component-name}--leaving & {
          animation: card-exit 0.3s cubic-bezier(1, 0, 0, 1) forwards;
          animation-delay: 0.15s;
        }

        @media all and (min-width: $screen-md) {
          animation: card-entrance 0.5s cubic-bezier(0.66, 0, 0.07, 1) forwards;
          transition-delay: 0.5s;
          width: 420px;
        }

        @media (height <= 630px) {
          display: none;
        }

        @media (height <= 800px) {
          width: 300px;
        }
      }
    }

    &-card-white {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 450px;
      left: 50%;
      transform: translateX(-150px);
      z-index: 1;
      filter: drop-shadow(0 16px 48px rgba(0 0 0 / 10%));

      @at-root .theme-dark & {
        filter: drop-shadow(0 16px 48px rgba($color-base-black-100-dark, 0.1));
      }

      @at-root .theme-light & {
        filter: drop-shadow(0 16px 48px rgba($color-base-black-100-light, 0.1));
      }

      @media all and (min-width: $screen-md) {
        transform: translateX(-120px);
      }

      img {
        width: 300px;
        transform: translateY(100%);
        animation: card-entrance 0.5s cubic-bezier(1, 0, 0, 1) forwards;
        animation-delay: 0.6s;

        .#{$component-name}--leaving & {
          animation: card-exit 0.3s cubic-bezier(1, 0, 0, 1) forwards;
        }

        @media all and (min-width: $screen-md) {
          animation: card-entrance 0.5s cubic-bezier(1, 0, 0, 1) forwards;
          animation-delay: 0.2s;
          width: 420px;
        }

        @media (height <= 630px) {
          display: none;
        }

        @media (height <= 800px) {
          width: 350px;
        }
      }
    }
  }
}

@keyframes card-entrance {
  0% {
    transform: translate(100px, 100%);
  }

  100% {
    transform: translateX(0);
  }
}

@keyframes card-exit {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(100%);
  }
}

@keyframes scale-fade-in {
  0% {
    scale: 0.1;
  }

  100% {
    scale: 1;
  }
}

@keyframes scale-fade-out {
  0% {
    scale: 1;
  }

  100% {
    scale: 0;
  }
}
</style>
