<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { computed, onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import CardPlaceholder from "@/features/Wallet/CardsListing/CardPlaceholder.vue";
import store from "@/store";

const emit = defineEmits<{
  (e: "continue"): void;
}>();

const features = [
  "Single-use or recurring cards",
  "Protect against fraud with custom spend controls",
  "Up to $3 million in Identity Theft Insurance",
];

const isWebviewMode = computed(() => {
  return store.state.ui.webviewMode;
});

onMounted(() => {
  posthogCapture("pay_kyc_intro_screenview");
});

function handleContinue() {
  posthogCapture("pay_kyc_intro_continue_tapped");
  emit("continue");
}
</script>

<template>
  <div
    class="vc-subs-intro-step-1"
    :class="{ 'vc-subs-intro-step-1--webview': isWebviewMode }"
  >
    <header class="vc-subs-intro-step-1__header">
      <BaseMedallion
        size="lg"
        color="spam-protection"
        icon="wallet-filled"
      />
      <BaseText
        variant="headline-2-semibold"
        class="vc-subs-intro-step-1__title"
      >
        Introducing Cloaked Pay
      </BaseText>
      <BaseText
        variant="headline-5-bold"
        class="vc-subs-intro-step-1__description"
      >
        A new Virtual Card for every checkout.
      </BaseText>
    </header>
    <div class="vc-subs-intro-step-1__content">
      <div class="vc-subs-intro-step-1__features">
        <BaseText
          variant="body-2-semibold"
          class="vc-subs-intro-step-1__features-title"
        >
          Features included
        </BaseText>
        <ul class="vc-subs-intro-step-1__features-list">
          <li
            v-for="feature in features"
            :key="feature"
            class="vc-subs-intro-step-1__features-item"
          >
            <BaseIcon name="check" />
            <BaseText
              variant="body-3-semibold"
              class="vc-subs-intro-step-1__features-item-text"
            >
              {{ feature }}
            </BaseText>
          </li>
        </ul>
      </div>
      <BaseButton
        variant="primary"
        class="vc-subs-intro-step-1__button"
        @click="handleContinue"
      >
        Continue
      </BaseButton>

      <CardPlaceholder
        class="vc-subs-intro-step-1__card-placeholder vc-subs-intro-step-1__card-placeholder--fs"
        brand="visa"
        last4="004"
      />
      <CardPlaceholder
        class="vc-subs-intro-step-1__card-placeholder vc-subs-intro-step-1__card-placeholder--cloaked"
        brand="cloaked"
        card-name="Cloaked"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
$spring-ease: cubic-bezier(0.68, -1.3, 0.32, 1.3);

.vc-subs-intro-step-1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  overflow: hidden;
  padding: 0 16px;

  @media (min-width: $screen-md) {
    padding: 0;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__title {
    text-align: center;
    margin-top: 13px;
    max-width: 280px;

    @media (min-width: $screen-md) {
      max-width: unset;
    }
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
  }

  &__features {
    display: flex;
    flex-direction: column;
    background-color: $color-base-white-80;
    border-radius: 24px;
    border: 1px solid $color-base-black-10;
    padding: 20px;
    box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);
    margin-top: 16px;
    gap: 8px;

    &-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &-item {
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      animation: fade-in 0.3s;
      animation-fill-mode: forwards;

      @for $i from 1 through 3 {
        &:nth-child(#{$i}) {
          animation-delay: #{$i * 0.09}s;
        }
      }

      &-text {
        color: $color-primary-70;
      }
    }
  }

  &__button {
    width: 100%;
    margin-top: 24px;
    z-index: 2;
  }

  &__card-placeholder {
    width: 455px;
    position: absolute;
    transform: translate(-80px, 20%);
    scale: 0.6;
    left: calc(50% - 70.5px);
    bottom: -50px;

    .vc-subs-intro-step-1--webview & {
      display: none;
    }

    @media all and (min-width: $screen-xxl) {
      scale: 0.85;
      bottom: -3%;
      left: 49.3%;
    }

    @media (height <= 899px) {
      bottom: -9.5%;
      scale: 0.78;
      left: 48%;
    }

    @media (height <= 790px) {
      display: none;
    }

    &--fs {
      transform: translate(-50%, 140%);
      animation: fs-slide 0.5s $spring-ease forwards;
    }

    &--cloaked {
      transform: translate(-50%, 140%);
      z-index: 1;
      animation: cloaked-slide 0.5s $spring-ease forwards;
      animation-delay: 0.1s;
    }
  }
}

@keyframes fs-slide {
  0% {
    transform: translate(-50%, 140%);
  }

  100% {
    transform: translate(calc(-50% - 100px), 50px) rotate(-15deg);
  }
}

@keyframes cloaked-slide {
  0% {
    transform: translate(-50%, 140%);
  }

  100% {
    transform: translate(calc(-50% + 50px), -20px) rotate(15deg);
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
