<script setup>
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import PageCheckoutReviews from "@/features/subscribe/PageCheckoutReviews.vue";
import PageCheckoutHeader from "@/features/subscribe/PageCheckoutHeader.vue";
import DataDeleteProtectionPlanSlider from "@/features/data-delete/DataDeleteProtectionPlanSlider.vue";
import DataDeleteProtectionPlanFeatureCard from "@/features/data-delete/atoms/DataDeleteProtectionPlanFeatureCard.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_USER_VIEWED_INTERMEDIATE_CHECKOUT_SCREEN,
  PH_EVENT_USER_CLICKED_CONTINUE_ON_INTERMEDIATE_CHECKOUT_SCREEN,
} from "@/scripts/posthogEvents";
import { RouterLink } from "vue-router";
import { onMounted } from "vue";

const emit = defineEmits(["checkout"]);

const onCheckout = () => {
  emit("checkout");
  posthogCapture(
    PH_EVENT_USER_CLICKED_CONTINUE_ON_INTERMEDIATE_CHECKOUT_SCREEN
  );
};

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_INTERMEDIATE_CHECKOUT_SCREEN);
});

const protectionPlanFeatures = [
  {
    title: "Exposure Removal",
    description:
      "We send legal removal notices to 130+ data brokers on your behalf.",
    status: "Full removal in 2-4 weeks",
  },
  {
    title: "Spam Blocking",
    description:
      "Our mobile app screens your  calls and blocks all incoming spam.",
    status: "Starting today",
  },
  {
    title: "Identity Theft Insurance",
    description: "We cover you with an extensive $1M identity theft insurance.",
    status: "Active immediately",
  },
];

const nextSteps = [
  "Sign up for Cloaked",
  "Download the app and set up spam blocking",
  "We'll email you with your first removal results",
];
</script>

<template>
  <div class="data-delete-protection-plans data-delete__page">
    <PageCheckoutReviews class="data-delete-protection-plans__reviews" />
    <PageCheckoutHeader class="data-delete-protection-plans__header">
      <RouterLink
        to="/auth/login"
        class="data-delete-protection-plans__login"
      >
        <BaseText variant="body-3-semibold">Already Subscribed?</BaseText>
      </RouterLink>
    </PageCheckoutHeader>

    <div class="data-delete-protection-plans__content">
      <div class="data-delete-protection-plans__header-section">
        <div class="data-delete-protection-plans__header-flexbox">
          <div class="data-delete-protection-plans__header-icon">
            <BaseIcon name="shield-user" />
          </div>
          <BaseText
            as="h1"
            variant="headline-2-semibold"
            class="data-delete-protection-plans__title"
          >
            Your Privacy Plan
          </BaseText>
        </div>
        <div>
          <BaseText
            variant="headline-3-medium"
            as="p"
            class="data-delete-protection-plans__subtitle"
          >
            You’re one step away from being protected.
          </BaseText>
        </div>
      </div>

      <div class="data-delete-protection-plans__features">
        <div class="data-delete-protection-plans__features-desktop">
          <DataDeleteProtectionPlanFeatureCard
            v-for="(feature, index) in protectionPlanFeatures"
            :key="index"
            :feature="feature"
            :index="index"
            class="data-delete-protection-plans__feature-card"
          />
        </div>

        <DataDeleteProtectionPlanSlider
          :items="protectionPlanFeatures"
          class="data-delete-protection-plans__features-mobile"
        />
      </div>

      <div class="data-delete-protection-plans__next-steps">
        <div class="data-delete-protection-plans__next-steps-header">
          <div class="data-delete-protection-plans__next-steps-icon">
            <BaseIcon name="check-list" />
          </div>
          <BaseText
            variant="headline-2-semibold"
            class="data-delete-protection-plans__next-steps-title"
          >
            What Happens Next
          </BaseText>
        </div>
        <ul class="data-delete-protection-plans__next-steps-list">
          <li
            v-for="(step, index) in nextSteps"
            :key="index"
            class="data-delete-protection-plans__next-steps-item"
          >
            <BaseIcon
              name="check"
              class="data-delete-protection-plans__next-steps-check"
            />
            <BaseText variant="headline-6-medium">{{ step }}</BaseText>
          </li>
        </ul>
      </div>

      <div class="data-delete-protection-plans__cta-section">
        <DataDeleteSticky class="data-delete-protection-plans__cta">
          <BaseButton
            variant="primary"
            size="lg"
            icon="arrow-right"
            class="data-delete-protection-plans__cta-button"
            full-width
            @click="onCheckout"
          >
            Get protected now
          </BaseButton>
          <div class="data-delete-protection-plans__guarantee">
            <BaseIcon
              name="shield-lock"
              class="data-delete-protection-plans__guarantee-icon"
            />
            <BaseText
              variant="label-semibold"
              class="data-delete-protection-plans__guarantee-text"
            >
              30-day money-back guarantee. Switch plans anytime.
            </BaseText>
          </div>
        </DataDeleteSticky>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-delete-protection-plans {
  &.data-delete__page {
    margin-top: 0;
    padding: 0;
    width: 100%;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  &__reviews {
    display: none;

    @media all and (min-width: $screen-xl) {
      display: flex;
      width: 100%;
    }
  }

  &__header {
    background-color: transparent;
    padding: 43px 16px 0;

    @media all and (min-width: $screen-xl) {
      padding: 28px 16px;
      display: flex;
      width: 100%;
    }
  }

  &__content {
    max-width: 1120px;
    margin: 0 auto;
    padding: 40px 16px 80px;

    @media all and (min-width: $screen-sm) {
      padding: 30px 16px 40px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }

  &__header-section {
    @media screen and (min-width: $screen-sm) {
      display: flex;
      flex-direction: column;
      justify-self: center;
      align-items: center;
      text-align: center;
    }
  }

  &__login {
    opacity: 0.8;
    text-decoration: underline;

    &:hover {
      opacity: 0.7;
    }
  }

  &__header-flexbox {
    display: flex;
    gap: 10px;
    align-items: center;
    opacity: 0;
    animation: appear-bottom-5 0.3s forwards ease-out;
  }

  &__header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 30px;
    background-color: $color-safe-zone-blue;
    flex-shrink: 0;
    font-size: 20px;

    @media all and (min-width: $screen-xl) {
      margin-bottom: 0;
      flex-shrink: 0;
    }

    @media screen and (min-width: $screen-sm) {
      display: none;
    }
  }

  &__title {
    font-size: 29px;

    @media all and (min-width: $screen-sm) {
      margin-bottom: 8px;
      font-size: 32px;
    }
  }

  &__subtitle {
    font-size: 16px;
    margin-left: 45px;
    margin-top: 2px;
    color: $color-base-black-80-dark;
    opacity: 0;
    animation: appear-bottom-5 0.3s 0.1s forwards ease-out;

    @media all and (min-width: $screen-sm) {
      font-size: 24px;
      margin-left: 0;
      margin-top: 0;
    }
  }

  &__features {
    margin-bottom: 12px;
    margin-top: 12px;
    opacity: 0;
    animation: appear-bottom-5 0.3s 0.2s forwards ease-out;

    @media all and (min-width: $screen-md) {
      margin-top: 32px;
      margin-bottom: 42px;
    }
  }

  &__features-desktop {
    display: none;
    grid-template-columns: auto auto auto;
    justify-content: center;
    gap: 24px;

    @media all and (min-width: $screen-md) {
      display: grid;
    }
  }

  &__features-mobile {
    @media all and (min-width: $screen-md) {
      display: none;
    }
  }

  &__next-steps {
    margin-bottom: 48px;
    margin-left: auto;
    margin-right: auto;

    @media screen and (min-width: $screen-sm) {
      max-width: 384px;
    }

    @media all and (min-width: $screen-xl) {
      margin-bottom: 56px;
    }
  }

  &__next-steps-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
    opacity: 0;
    animation: appear-bottom-5 0.3s 0.3s forwards ease-out;

    @media all and (min-width: $screen-sm) {
      margin-bottom: 16px;
    }
  }

  &__next-steps-icon {
    background-color: $color-safe-zone-green;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-white;
    font-size: 19px;
    border-radius: 30px;

    @media all and (min-width: $screen-sm) {
      display: none;
    }
  }

  &__next-steps-title {
    font-size: 29px;

    @media all and (min-width: $screen-sm) {
      font-size: 32px;
    }
  }

  &__next-steps-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-left: 40px;

    @media all and (min-width: $screen-sm) {
      margin-left: 0;
      gap: 8px;
    }
  }

  &__next-steps-item {
    display: flex;
    gap: 5px;

    &:nth-child(1) {
      opacity: 0;
      animation: appear-bottom-5 0.3s 0.35s forwards ease-out;
    }

    &:nth-child(2) {
      opacity: 0;
      animation: appear-bottom-5 0.3s 0.4s forwards ease-out;
    }

    &:nth-child(3) {
      opacity: 0;
      animation: appear-bottom-5 0.3s 0.45s forwards ease-out;
    }
  }

  &__next-steps-check {
    color: $color-safe-zone-green;
    font-size: 20px;
    flex-shrink: 0;
  }

  &__cta-section {
    display: flex;
    justify-content: center;
  }

  &__cta {
    width: 100%;
    max-width: 500px;

    &-button {
      width: 100%;
      background: $color-gradient-blue;
      border: 0;
      opacity: 0;
      animation: appear-bottom-5 0.3s 0.5s forwards ease-out;

      :deep(.base-button__text) {
        color: $color-white;
      }

      :deep(.base-button__icon) {
        color: $color-white;
        background-color: $color-base-white-15-light;
      }
    }
  }

  &__guarantee {
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: center;
    margin-top: 16px;
    opacity: 0;
    animation: appear-bottom-5 0.3s 0.55s forwards ease-out;
  }

  &__guarantee-icon {
    color: $color-white;
    width: 14px;
    height: 15px;
    flex-shrink: 0;
  }

  &__guarantee-text {
    text-align: center;
    font-size: 11px;
    margin-top: 2px;
    margin-left: 1px;
  }

  &__feature-card {
    max-width: 270px;

    &.data-delete-card {
      border: 0;
    }
  }
}
</style>
