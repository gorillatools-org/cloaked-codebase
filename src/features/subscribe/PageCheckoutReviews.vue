<script setup lang="ts">
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <div class="page-checkout-reviews">
    <div class="page-checkout-reviews__platform">
      <InlineSvg
        name="chrome-web-store"
        class="page-checkout-reviews__logo"
      />
      <div class="page-checkout-reviews__stars">
        <InlineSvg name="star-full" />
        <InlineSvg name="star-full" />
        <InlineSvg name="star-full" />
        <InlineSvg name="star-full" />
        <InlineSvg name="star-half" />
      </div>
      <BaseText variant="body-3-semibold">4.6 stars</BaseText>
    </div>
    <div class="page-checkout-reviews__divider" />
    <div class="page-checkout-reviews__platform">
      <InlineSvg
        name="app-store"
        class="page-checkout-reviews__logo"
      />
      <div class="page-checkout-reviews__stars">
        <InlineSvg name="star-full" />
        <InlineSvg name="star-full" />
        <InlineSvg name="star-full" />
        <InlineSvg name="star-full" />
        <InlineSvg name="star-half" />
      </div>
      <BaseText variant="body-3-semibold">4.5 stars</BaseText>
    </div>
    <div class="page-checkout-reviews__divider" />
    <div class="page-checkout-reviews__platform">
      <InlineSvg
        name="google-play"
        class="page-checkout-reviews__logo"
      />
      <div class="page-checkout-reviews__stars">
        <InlineSvg name="star-full" />
        <InlineSvg name="star-full" />
        <InlineSvg name="star-full" />
        <InlineSvg name="star-full" />
        <InlineSvg name="star-half" />
      </div>
      <BaseText variant="body-3-semibold">4.2 stars</BaseText>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.page-checkout-reviews {
  display: flex;
  align-items: center;
  padding: 16px;
  justify-content: center;
  overflow: hidden;

  @at-root .theme-dark & {
    background-color: $color-base-white-20-light;
  }

  @at-root .theme-light & {
    background-color: $color-spam-protection;
  }

  @media all and (min-width: $screen-xl) {
    gap: 56px;
    justify-content: center;
  }

  &__platform {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
    gap: 8px;
    flex-shrink: 0;
    width: 100dvw;
    color: $color-base-white-100-light;

    @media all and (min-width: $screen-xl) {
      width: auto;
    }

    $animation-duration: 20s;

    &:nth-child(1) {
      transform: translateX(100dvw);
      animation: fadein $animation-duration infinite ease;

      @media all and (min-width: $screen-xl) {
        animation: none;
        transform: translateX(0);
      }
    }

    &:nth-child(3) {
      transform: translateX(0dvw);
      opacity: 0;
      animation: fadein $animation-duration calc($animation-duration / 3)
        infinite ease-in-out;

      @media all and (min-width: $screen-xl) {
        animation: none;
        opacity: 1;
        transform: translateX(0);
      }
    }

    &:nth-child(5) {
      opacity: 0;
      transform: translateX(-100dvw);
      animation: fadein $animation-duration calc($animation-duration * 2 / 3)
        infinite ease-in-out;

      @media all and (min-width: $screen-xl) {
        animation: none;
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadein {
      0% {
        opacity: 0;
      }
      2% {
        opacity: 1;
      }
      26% {
        opacity: 1;
      }
      30% {
        opacity: 0;
      }
      100% {
        opacity: 0;
      }
    }
  }

  &__logo {
    margin-bottom: 4px;
  }

  &__divider {
    width: 1px;
    align-self: stretch;
    background-color: $color-base-white-15-light;
    display: none;

    @media all and (min-width: $screen-xl) {
      display: block;
    }
  }
}
</style>
