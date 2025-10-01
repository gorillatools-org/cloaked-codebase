<template>
  <div class="kyc-flow-agreements">
    <header class="kyc-flow-agreements__header">
      <BaseText
        as="h1"
        variant="headline-2-semibold"
        class="kyc-flow-agreements__header-title"
      >
        By submitting this application you agree to the following agreements:
      </BaseText>
    </header>

    <div class="kyc-flow-agreements__content">
      <div class="kyc-flow-agreements__agreements-scroll">
        <VirtualCardsAgreementsList />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import VirtualCardsAgreementsList from "@/features/VirtualCards/Subscription/application/steps/agreements/VirtualCardsAgreementsList.vue";
</script>

<style lang="scss" scoped>
$component-name: "kyc-flow-agreements";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 24px;

  &__header {
    margin-top: 24px;

    &-title {
      color: $color-primary-100;
      font-size: 29px;
      font-weight: 600;
      text-align: center;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
    margin-top: 24px;
    position: relative;
  }

  &__agreements-scroll {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    flex: 1 1 auto;

    @mixin scroll-gradient($direction: bottom) {
      display: block;
      height: 30px;
      position: absolute;
      z-index: 1;
      width: 100%;
      background: linear-gradient(
        to $direction,
        rgba($color-base-white-100-light, 0),
        rgba($color-base-white-100-light, 1)
      );
      pointer-events: none;

      @at-root .theme-dark & {
        background: linear-gradient(
          to $direction,
          rgba($color-base-white-100-dark, 0),
          rgba($color-base-white-100-dark, 1),
          rgba($color-base-white-100-dark, 1)
        );
      }
    }

    &::after {
      content: "";
      bottom: 0;
      right: 16px;

      @include scroll-gradient;
    }

    &::before {
      content: "";
      top: 0;
      right: 16px;

      @include scroll-gradient(top);
    }
  }
}
</style>
