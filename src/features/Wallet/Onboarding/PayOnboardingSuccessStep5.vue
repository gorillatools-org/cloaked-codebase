<script setup lang="ts">
import { ref } from "vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import CardPlaceholder from "@/features/Wallet/CardsListing/CardPlaceholder.vue";
import ConfettiExplosion from "@/features/ConfettiExplosion.vue";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog";
import { useDevice } from "@/composables/useDevice";

const emit = defineEmits<{
  (e: "continue"): void;
}>();

defineProps<{
  cardAmount: string;
  last4: string;
}>();

const { isMobile } = useDevice();
const cardContainer = ref<HTMLElement | null>(null);
const maxAngle = 15;

const handleMouseMove = (e: MouseEvent) => {
  const container = cardContainer.value;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const mouseX = e.clientX - rect.left - centerX;
  const mouseY = e.clientY - rect.top - centerY;

  const rotateX = (mouseY / centerY) * maxAngle;
  const rotateY = (-mouseX / centerX) * maxAngle;

  const card = container.querySelector(
    ".pay-onboarding-success-step-5__card"
  ) as HTMLElement;
  if (!card) return;

  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  const shift = 20;
  const reflectX = 50 + (rotateY / maxAngle) * shift;
  const reflectY = 50 - (rotateX / maxAngle) * shift;

  card.style.setProperty("--reflect-x", `${reflectX}%`);
  card.style.setProperty("--reflect-y", `${reflectY}%`);
};

const resetRotation = () => {
  const card = cardContainer.value?.querySelector(
    ".pay-onboarding-success-step-5__card"
  ) as HTMLElement;
  if (!card) return;

  card.style.transform = "rotateX(0deg) rotateY(0deg)";
  card.style.setProperty("--reflect-x", "50%");
  card.style.setProperty("--reflect-y", "50%");
};

function toggleDownloadAppModal() {
  if (isMobile.value) {
    window.open(DOWNLOAD_APP_URL, "_blank");
  } else {
    store.dispatch("toggleMobileAppModal", true);
  }

  posthogCapture("pay_post_kyc_onboarding_add_to_digital_wallet_tapped");
}

const handleViewCard = () => {
  emit("continue");
  posthogCapture("pay_post_kyc_onboarding_view_card_tapped");
};
</script>
<template>
  <div class="pay-onboarding-success-step-5">
    <BaseMedallion
      size="lg"
      color="safe-zone-green"
      icon="check"
    />
    <BaseText
      variant="headline-2-semibold"
      class="pay-onboarding-success-step-5__title"
    >
      Your first Virtual Card is ready
    </BaseText>
    <BaseText
      variant="headline-6-medium"
      class="pay-onboarding-success-step-5__description"
    >
      Your new card, Cloak One, is loaded and protected. Add nicknames, update
      limits, set spending controls, and create more cards from your Wallet.
    </BaseText>

    <div
      ref="cardContainer"
      class="pay-onboarding-success-step-5__card-perspective"
      @mousemove="handleMouseMove"
      @mouseleave="resetRotation"
    >
      <CardPlaceholder
        :amount-text="cardAmount"
        brand="cloaked"
        :last4="last4"
        class="pay-onboarding-success-step-5__card"
      />
    </div>

    <footer class="pay-onboarding-success-step-5__footer">
      <BaseButton
        variant="primary"
        class="pay-onboarding-success-step-5__footer-btn"
        @click="!isMobile ? handleViewCard() : toggleDownloadAppModal()"
      >
        View Card in Cloaked Wallet
      </BaseButton>
      <BaseButton
        v-if="!isMobile"
        variant="secondary"
        class="pay-onboarding-success-step-5__footer-btn"
        icon="plus"
        @click="toggleDownloadAppModal"
      >
        Add to Digital Wallet
      </BaseButton>
    </footer>

    <div class="pay-onboarding-success-step-5__confetti-container">
      <ConfettiExplosion
        class="pay-onboarding-success-step-5__confetti pay-onboarding-success-step-5__confetti--left"
        :particle-count="100"
        :delay="500"
      />
      <ConfettiExplosion
        class="pay-onboarding-success-step-5__confetti pay-onboarding-success-step-5__confetti--right"
        :particle-count="100"
        :delay="500"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
$component-name: "pay-onboarding-success-step-5";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  position: relative;
  padding: 0 20px;

  &__title {
    text-align: center;

    @media all and (width < $screen-sm) {
      font-size: 29px;
      padding-inline: 24px;
    }
  }

  &__description {
    text-align: center;
    max-width: 550px;
  }

  &__card {
    position: relative;
    overflow: hidden;
    backface-visibility: hidden;
    transition: transform 0.15s ease-out;
    transform-style: preserve-3d;
    will-change: transform;
    animation: card-entrance 0.6s cubic-bezier(0.68, -1.3, 0.32, 1.3);
    opacity: 1;

    // initialize reflection position
    --reflect-x: 50%;
    --reflect-y: 50%;

    @media all and (width < $screen-lg) {
      animation:
        card-entrance 0.6s cubic-bezier(0.68, -1.3, 0.32, 1.3),
        card-showcase 10s ease-in-out 0.6s infinite;
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 40%,
        rgba(255 255 255 / 15%) 50%,
        transparent 60%
      );
      transform: translate(-50%, -50%)
        translate(var(--reflect-x), var(--reflect-y));
      filter: blur(30px);
      scale: 1.4;
      pointer-events: none;
      mix-blend-mode: screen;
      will-change: transform;
      transition: transform 0.1s ease-out;

      @media all and (width < $screen-lg) {
        animation: reflection-showcase 10s ease-in-out 0.6s infinite;
      }

      @at-root .theme-dark & {
        background: linear-gradient(
          45deg,
          transparent 40%,
          rgba(255 255 255 / 10%) 50%,
          transparent 60%
        );
      }
    }
  }

  &__card-perspective {
    perspective: 1000px;
    width: calc(125% + 40px);
    height: 260px;
    scale: 0.72;

    @media screen and (min-width: $screen-sm) {
      width: 435px;
      scale: 0.9;
      height: auto;
    }

    @media screen and (min-width: $screen-md) {
      width: 455px;
      scale: 0.9;
    }

    @media all and (min-width: $screen-xxl) {
      scale: unset;
      margin-top: 32px;
    }

    @media (height <= 750px) and (min-width: $screen-md) {
      scale: 0.75;
      margin-top: 0;
      height: 220px;
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: 0;
    width: 327px;
    animation: fade-in 0.3s ease-in-out forwards;
    animation-delay: 1s;
    padding-bottom: 20px;

    @media all and (min-width: $screen-sm) {
      scale: unset;
      margin-top: 24px;
    }

    &-btn {
      width: 100%;
    }
  }

  &__confetti {
    position: absolute;
    width: 100%;
    bottom: 60%;

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
}

@keyframes card-entrance {
  from {
    opacity: 0;
    transform: translateY(130px) scale(0.7);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes card-showcase {
  0% {
    transform: rotateX(0deg) rotateY(0deg);
  }

  12.5% {
    transform: rotateX(4deg) rotateY(-6deg);
  }

  25% {
    transform: rotateX(8deg) rotateY(-12deg);
  }

  37.5% {
    transform: rotateX(2deg) rotateY(-1deg);
  }

  50% {
    transform: rotateX(-6deg) rotateY(10deg);
  }

  62.5% {
    transform: rotateX(-2deg) rotateY(1deg);
  }

  75% {
    transform: rotateX(5deg) rotateY(-8deg);
  }

  87.5% {
    transform: rotateX(2deg) rotateY(-4deg);
  }

  100% {
    transform: rotateX(0deg) rotateY(0deg);
  }
}

@keyframes reflection-showcase {
  0% {
    transform: translate(-50%, -50%) translate(50%, 50%);
  }

  12.5% {
    transform: translate(-50%, -50%) translate(42%, 44.67%);
  }

  25% {
    transform: translate(-50%, -50%) translate(34%, 39.33%);
  }

  37.5% {
    transform: translate(-50%, -50%) translate(48.67%, 47.33%);
  }

  50% {
    transform: translate(-50%, -50%) translate(63.33%, 58%);
  }

  62.5% {
    transform: translate(-50%, -50%) translate(51.33%, 52.67%);
  }

  75% {
    transform: translate(-50%, -50%) translate(39.33%, 43.33%);
  }

  87.5% {
    transform: translate(-50%, -50%) translate(44.67%, 47.33%);
  }

  100% {
    transform: translate(-50%, -50%) translate(50%, 50%);
  }
}
</style>
