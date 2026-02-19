<script setup lang="ts">
import { onMounted } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import VCAgreementsList from "@/features/VirtualCards/components/agreements/VCAgreementsList.vue";
import { useDevice } from "@/composables/useDevice";

const emit = defineEmits(["submit"]);
const { isMobile } = useDevice();

onMounted(() => {
  posthogCapture("pay_kyc_agreements_screenview");
});

const handleSubmitCtaClick = () => {
  posthogCapture("pay_kyc_agreements_submit_tapped");
  emit("submit");
};
</script>

<template>
  <div class="vc-application-agreements">
    <div class="vc-application-agreements__wrapper">
      <header class="vc-application-agreements__header">
        <BaseText
          as="h1"
          variant="headline-2-semibold"
          class="vc-application-agreements__header-title"
        >
          By submitting this application you agree to the following agreements:
        </BaseText>
      </header>

      <div class="vc-application-agreements__content">
        <VCAgreementsList />
      </div>
      <Teleport
        to="body"
        :disabled="!isMobile"
      >
        <footer class="vc-application-agreements__footer">
          <BaseButton
            icon="send"
            variant="primary"
            class="vc-application-agreements__footer-btn"
            @click="handleSubmitCtaClick"
          >
            Submit verification
          </BaseButton>
        </footer>
      </Teleport>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin fade($direction: bottom) {
  display: block;
  height: 50px;
  position: absolute;
  z-index: 1;
  width: 100%;
  background: linear-gradient(
    to $direction,
    rgba($color-primary-5-light, 0),
    rgba($color-primary-5-light, 1)
  );
  pointer-events: none;

  @at-root body:has(.theme-dark) & {
    background: linear-gradient(
      to $direction,
      rgba($color-primary-5-dark, 0),
      rgba($color-primary-5-dark, 1)
    );
  }
}

$component-name: "vc-application-agreements";

.#{$component-name} {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__wrapper {
    max-width: 510px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  &__header {
    &-title {
      color: $color-primary-100;
      font-size: 24px;
      font-weight: 600;
      text-align: center;

      @media (min-width: $screen-md) {
        font-size: 29px;
      }
    }
  }

  &__content {
    flex: 1;
    min-height: 0;
    margin-top: 15px;
    position: relative;
    overflow: visible;
    padding-bottom: 20px;

    &::after {
      content: "";
      bottom: 20px;
      right: 16px;

      @include fade;
    }

    &::before {
      content: "";
      top: 0;
      right: 16px;

      @include fade(top);
    }
  }

  &__agreements-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-block: 30px;
    position: relative;
  }

  &__sections {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-right: 16px;
  }

  &__item {
    &-container {
      background: $color-primary-5;
      border: 1px solid $color-base-black-15;
      border-radius: 30px;
      transition:
        border 0.2s ease-in-out,
        background 0.2s ease-in-out;

      .#{$component-name}__item--active & {
        border: 1px solid $color-primary-100;
        overflow: visible;
        max-height: none;
        box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);
        background: rgba($color-base-white-80-light, 0.8);
        backdrop-filter: blur(13px);

        @at-root .theme-dark & {
          background: rgba($color-base-white-80-dark, 0.8);
        }
      }
    }

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      padding: 16px;
      transition: padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);

      .#{$component-name}__item--active & {
        padding-bottom: 0;
      }

      &-title-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      &-icon {
        color: $color-primary-100;
        font-size: 24px;

        &--chevron {
          font-size: 18px;
          transition: transform 0.2s ease-in-out;

          .#{$component-name}__item--active & {
            transform: rotate(90deg);
          }
        }
      }
    }

    &-content {
      max-height: 0;
      overflow: hidden;
      transition:
        max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        padding 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.3s ease-in-out;
      padding-inline: 16px;
      padding-top: 0;
      padding-bottom: 0;
      opacity: 0;

      .#{$component-name}__item--active & {
        max-height: 20000px;
        padding-block: 16px;
        opacity: 1;
        overflow: visible;
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    position: fixed;
    bottom: 0;
    padding: 12px 20px;
    padding-bottom: 30px;
    background: $color-primary-5-light;
    z-index: 9;

    @at-root body:has(.theme-dark) & {
      background: $color-primary-5-dark;
    }

    @media screen and (min-width: $screen-md) {
      position: sticky;
      bottom: 0;
      padding: 12px 0;
    }

    &::before {
      content: "";
      display: block;
      height: 35px;
      position: absolute;
      z-index: 1;
      width: 100%;
      max-width: 510px;
      top: -30px;
      background: linear-gradient(
        to bottom,
        rgba($color-primary-5-light, 0),
        rgba($color-primary-5-light, 1)
      );
      pointer-events: none;

      @at-root body:has(.theme-dark) & {
        background: linear-gradient(
          to bottom,
          rgba($color-primary-5-dark, 0),
          rgba($color-primary-5-dark, 1)
        );
      }
    }

    &-btn {
      width: 100%;
      max-width: 375px;

      @media (min-width: $screen-md) {
        width: 70%;
        max-width: none;
      }
    }
  }
}
</style>
