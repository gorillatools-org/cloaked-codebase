<script setup lang="ts">
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import Button from "@/features/Button.vue";
import VCCloseModalButton from "@/features/VirtualCards/modals/VCCloseModalButton.vue";
import CardPlaceholder from "@/features/Wallet/CardsListing/CardPlaceholder.vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "close-button-click"): void;
  (e: "dont-show-again"): void;
  (e: "finish-setup"): void;
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

function handleFinishSetup() {
  show.value = false;
  emit("finish-setup");
}
</script>

<template>
  <ModalTemplate
    :show="show"
    width="500px"
    without-header-padding
    without-body-padding
    without-footer-padding
    class="vc-lead-in-post-kyc-modal"
    @close="handleClose"
  >
    <template #header>
      <div class="vc-lead-in-post-kyc-modal__header">
        <div class="vc-lead-in-post-kyc-modal__cards-section">
          <div
            v-if="show"
            class="vc-lead-in-post-kyc-modal__cards-container"
          >
            <CardPlaceholder
              class="vc-lead-in-post-kyc-modal__card-placeholder vc-lead-in-post-kyc-modal__card-placeholder--fs"
              brand="visa"
              last4="4321"
            />
            <CardPlaceholder
              class="vc-lead-in-post-kyc-modal__card-placeholder vc-lead-in-post-kyc-modal__card-placeholder--cloaked"
              brand="cloaked"
              card-name="Cloaked"
            />
          </div>
        </div>
        <VCCloseModalButton
          class="vc-lead-in-post-kyc-modal__close-button"
          @close="handleCloseButtonClick"
        />
      </div>
    </template>

    <template #body>
      <div class="vc-lead-in-post-kyc-modal__body">
        <BaseText
          variant="headline-3-bold"
          class="vc-lead-in-post-kyc-modal__title"
        >
          You’re Approved!
        </BaseText>
        <BaseText
          variant="headline-6-medium"
          class="vc-lead-in-post-kyc-modal__description"
        >
          Just one step left to unlock Virtual Cards. Keep your real card number
          private and protected at every checkout.
        </BaseText>
      </div>
    </template>

    <template #footer>
      <div class="vc-lead-in-post-kyc-modal__footer">
        <button
          type="button"
          class="vc-lead-in-post-kyc-modal__dont-show-again"
          @click="handleDontShowAgain"
        >
          Don't Show Again
        </button>
        <Button
          type="primary"
          class="vc-lead-in-post-kyc-modal__button"
          @click="handleFinishSetup"
        >
          Finish Set-Up
        </Button>
      </div>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$base-padding: 32px;

.vc-lead-in-post-kyc-modal {
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
  }

  &__cards-section {
    position: relative;
    height: 242px;
    width: calc(100% + 2px);
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
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__card-placeholder {
    width: 455px;
    position: absolute;
    scale: 0.82;
    top: 50%;
    left: 35%;

    &--fs {
      transform: translate(calc(-50% - 200px), -50%) rotate(-20deg);
      animation:
        fs-slide-in 0.35s ease-out forwards,
        levitate 8s ease-in-out infinite 0.45s;
    }

    &--cloaked {
      transform: translate(calc(-50% + 300px), -50%) rotate(20deg);
      z-index: 1;
      animation:
        cloaked-slide-in 0.3s ease-out forwards,
        levitate2 6.5s ease-in-out infinite 0.4s;
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

@keyframes fs-slide-in {
  0% {
    transform: translate(calc(-50% - 170px), -50%) rotate(-30deg);
  }

  100% {
    transform: translate(calc(-50% - 30px), -50%) rotate(-15deg);
    opacity: 1;
  }
}

@keyframes cloaked-slide-in {
  0% {
    transform: translate(calc(-50% + 280px), -50%) rotate(35deg);
  }

  100% {
    transform: translate(calc(-50% + 140px), -50%) rotate(15deg);
    opacity: 1;
  }
}

@keyframes levitate {
  0%,
  100% {
    transform: translate(calc(-50% - 30px), -50%) rotate(-15deg);
  }

  50% {
    transform: translate(calc(-50% - 30px), calc(-50% - 8px)) rotate(-14deg);
  }
}

@keyframes levitate2 {
  0%,
  100% {
    transform: translate(calc(-50% + 140px), -50%) rotate(15deg);
  }

  50% {
    transform: translate(calc(-50% + 140px), calc(-50% - 6px)) rotate(14.2deg);
  }
}
</style>
