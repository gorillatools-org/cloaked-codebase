<script setup lang="ts">
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import Button from "@/features/Button.vue";
import VCCloseModalButton from "@/features/VirtualCards/modals/VCCloseModalButton.vue";
import CreditCardBlack from "@/assets/images/pay-lead-in/lead-in-cloaked-pay-black-card.webp";
import CreditCardWhite from "@/assets/images/pay-lead-in/lead-in-cloaked-pay-white-card.webp";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "close-button-click"): void;
  (e: "dont-show-again"): void;
  (e: "get-verified"): void;
}>();

const show = defineModel<boolean>({ default: false });

function handleClose() {
  show.value = false;
  emit("close");
}

function handleCloseButtonClick() {
  show.value = false;
  emit("close-button-click");
}

function handleDontShowAgain() {
  show.value = false;
  emit("dont-show-again");
}

function handleGetVerified() {
  show.value = false;
  emit("get-verified");
}
</script>

<template>
  <ModalTemplate
    :show="show"
    width="500px"
    without-header-padding
    without-body-padding
    without-footer-padding
    class="vc-lead-in-modal"
    @close="handleClose"
  >
    <template #header>
      <div class="vc-lead-in-modal__header">
        <div class="vc-lead-in-modal__cards-section">
          <div
            v-if="show"
            class="vc-lead-in-modal__cards-container"
          >
            <div class="vc-lead-in-modal__card vc-lead-in-modal__card--2">
              <img
                :src="CreditCardBlack"
                alt="Cloaked Pay Black Card"
                class="vc-lead-in-modal__card-image"
              />
            </div>
            <div class="vc-lead-in-modal__card vc-lead-in-modal__card--1">
              <img
                :src="CreditCardWhite"
                alt="Cloaked Pay White Card"
                class="vc-lead-in-modal__card-image"
              />
            </div>
          </div>
        </div>
        <VCCloseModalButton
          class="vc-lead-in-modal__close-button"
          @close="handleCloseButtonClick"
        />
      </div>
    </template>

    <template #body>
      <div class="vc-lead-in-modal__body">
        <BaseText
          variant="headline-3-bold"
          class="vc-lead-in-modal__title"
        >
          Cloaked Pay Is Here
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="vc-lead-in-modal__description"
        >
          Protect every checkout with a new Virtual Card number. Your real card
          stays private, and you keep earning rewards.
          <br />
          <br />
          Once you upgrade, your plan will include Virtual Cards and up to $3
          million in Identity Theft Protection.
        </BaseText>
      </div>
    </template>

    <template #footer>
      <div class="vc-lead-in-modal__footer">
        <button
          type="button"
          class="vc-lead-in-modal__dont-show-again"
          @click="handleDontShowAgain"
        >
          Don't Show Again
        </button>
        <Button
          type="primary"
          class="vc-lead-in-modal__button"
          @click="handleGetVerified"
        >
          Get Started
        </Button>
      </div>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$base-padding: 32px;

.vc-lead-in-modal {
  &__header {
    position: relative;
    padding: 0;
    z-index: 1;
  }

  &__close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1;

    @at-root .theme-dark & {
      background-color: $color-base-black-50-light;
      opacity: 0.6;
      transition: all 0.12s ease;

      &:hover {
        background-color: $color-base-black-50-light;
        opacity: 1;
      }
    }
  }

  &__cards-section {
    position: relative;
    height: 242px;
    width: 100%;
    overflow: hidden;
    z-index: 1;
    border-radius: 27px 27px 0 0;
    margin-top: -1px;
    margin-left: -1px;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, 0%);
      width: 558px;
      height: 558px;
      background-color: $color-primary-20;
      filter: blur(25px);
      border-radius: 100%;
    }
  }

  &__cards-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  &__card {
    position: absolute;

    &--1 {
      right: 0;
      top: 0;
      z-index: 2;
      filter: drop-shadow(0 5px 10px rgb(0 0 0 / 30%));
      opacity: 0.7;
      transform: translateX(70px) translateY(-50px) rotate(-18deg);
      animation:
        fly-in-card-1 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.1s,
        levitate 6.5s ease-in-out infinite 0.7s;
    }

    &--2 {
      right: 103px;
      top: 0;
      z-index: 1;
      opacity: 0.5;
      transform: translateX(-50px) translateY(35px) rotate(12deg);
      animation:
        fly-in-card-2 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.1s,
        levitate2 8s ease-in-out infinite 0.7s;
    }

    &-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: $base-padding;
    margin-top: 10px;
  }

  &__title {
    text-align: left;
    margin-bottom: 8px;
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
  }

  &__description {
    color: $color-primary-70;
    line-height: 1.4;
    font-size: 16px;
    font-weight: 500;
  }

  &__footer {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 $base-padding $base-padding;
  }

  &__dont-show-again {
    background: transparent;
    border: none;
    color: $color-primary-100;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    cursor: pointer;
    padding: 0;
    font-family: $global-font;

    &:hover {
      opacity: 0.8;
    }
  }

  &__button {
    font-size: 14px;
    font-weight: 600;
    min-width: 120px;
  }
}

@keyframes fly-in-card-1 {
  0% {
    opacity: 0.7;
    transform: translateX(70px) translateY(-50px) rotate(-18deg);
  }

  100% {
    opacity: 1;
    transform: translateX(0) translateY(0) rotate(0deg);
  }
}

@keyframes fly-in-card-2 {
  0% {
    opacity: 0.5;
    transform: translateX(-50px) translateY(35px) rotate(12deg);
  }

  100% {
    opacity: 1;
    transform: translateX(0) translateY(0) rotate(0deg);
  }
}

@keyframes levitate {
  0%,
  100% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }

  50% {
    transform: translateX(0) translateY(-8px) rotate(1deg);
  }
}

@keyframes levitate2 {
  0%,
  100% {
    transform: translateX(0) translateY(0) rotate(0deg);
  }

  50% {
    transform: translateX(0) translateY(-6px) rotate(-0.8deg);
  }
}
</style>
