<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import VirtualCardsAgreementsList from "@/features/VirtualCards/Subscription/application/steps/agreements/VirtualCardsAgreementsList.vue";

const emit = defineEmits(["submit"]);
</script>

<template>
  <div class="subs-onboarding-pay-agreements">
    <div class="subs-onboarding-pay-agreements__wrapper">
      <header class="subs-onboarding-pay-agreements__header">
        <BaseText
          as="h1"
          variant="headline-2-semibold"
          class="subs-onboarding-pay-agreements__header-title"
        >
          By submitting this application you agree to the following agreements:
        </BaseText>
      </header>

      <div class="subs-onboarding-pay-agreements__content">
        <VirtualCardsAgreementsList />
      </div>
      <footer class="subs-onboarding-pay-agreements__footer">
        <BaseButton
          icon="send"
          variant="primary"
          class="subs-onboarding-pay-agreements__footer-btn"
          @click="emit('submit')"
        >
          Submit application
        </BaseButton>
      </footer>
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
    rgba($color-primary-100-dark, 0),
    rgba($color-primary-100-dark, 1)
  );
  pointer-events: none;

  @at-root .theme-dark & {
    background: linear-gradient(
      to $direction,
      rgba($color-primary-100-light, 0),
      rgba($color-primary-100-light, 1)
    );
  }
}

.subs-onboarding-pay-agreements {
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
      font-size: 29px;
      font-weight: 600;
      text-align: center;
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

  &__footer {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    position: sticky;
    bottom: 0;
    padding: 12px 0;

    &-btn {
      width: 100%;
    }
  }
}
</style>
