<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import bbbBadge from "@/assets/icons/bbb-accredited-business-badge.svg?url";
import trustPilotStars from "@/assets/icons/trust-pilot-stars.svg?url";
import trustScore from "@/assets/icons/trust-score.svg?url";
</script>

<template>
  <div class="page-checkout-trusts-banner">
    <div
      v-for="index in 4"
      :key="index"
      class="page-checkout-trusts-banner__content"
    >
      <div class="page-checkout-trusts-banner__platform">
        <img
          :src="bbbBadge"
          class="page-checkout-trusts-banner__logo page-checkout-trusts-banner__logo--bbb"
          alt="BBB Accredited Business Badge"
        />
      </div>
      <div class="page-checkout-trusts-banner__divider" />
      <div class="page-checkout-trusts-banner__platform">
        <img
          :src="trustPilotStars"
          class="page-checkout-trusts-banner__logo page-checkout-trusts-banner__logo--trustpilot"
          alt="Trustpilot Stars"
        />
        <div class="page-checkout-trusts-banner__trustpilot">
          <img
            :src="trustScore"
            class="page-checkout-trusts-banner__score"
            alt="Trust Score"
          />
          <div class="page-checkout-trusts-banner__dot" />
          <BaseText
            variant="body-3-semibold"
            class="page-checkout-trusts-banner__trustpilot-reviews"
          >
            286 reviews
          </BaseText>
        </div>
      </div>
      <div class="page-checkout-trusts-banner__divider" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-checkout-trusts-banner {
  display: flex;
  z-index: 50;
  align-items: center;
  padding: 10px 24px;
  gap: 56px;
  overflow: hidden;
  cursor: default;
  height: 56px;

  @at-root .theme-dark & {
    background-color: $color-base-white-10-light;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 56px;
    flex-shrink: 0;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }

    100% {
      transform: translateX(-109%);
    }
  }

  &__platform {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    color: $color-base-white-100-light;
  }

  &__logo {
    height: auto;

    &--bbb {
      width: 86px;
    }

    &--trustpilot {
      width: 100px;
    }
  }

  &__score {
    width: 93px;
  }

  &__dot {
    width: 2px;
    height: 2px;
    background-color: $color-base-black-60-dark;
    border-radius: 50%;
  }

  &__trustpilot {
    display: flex;
    align-items: center;
    gap: 8px;

    &-reviews {
      color: $color-base-black-60-dark;
      font-weight: 500;
    }
  }

  &__divider {
    width: 1px;
    height: 27px;
    background-color: $color-base-black-40-dark;
  }

  @media (hover: hover) {
    &:hover &__content {
      animation-play-state: paused;
    }
  }
}
</style>
