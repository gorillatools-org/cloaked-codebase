<script setup>
import OnboardingPageLogo from "@/features/onboarding/page/OnboardingPageLogo.vue";
import { logout } from "@/scripts/actions/auth";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  buttonLabel: {
    type: String,
    default: "Sign out",
  },
  action: {
    type: Function,
    default: () => logout(),
  },
});
</script>

<template>
  <header class="onboarding-page-header">
    <OnboardingPageLogo class="onboarding-page-header__logo" />
    <button
      class="onboarding-page-header__button"
      @click="props.action()"
    >
      <BaseText variant="headline-6-medium">{{ props.buttonLabel }}</BaseText>
    </button>
  </header>
</template>

<style lang="scss" scoped>
.onboarding-page-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (min-width: $screen-xl) {
    padding: 40px;
  }

  &__logo {
    color: $color-primary-100;
  }

  &__button {
    color: $color-primary-100;
    font-family: $global-font;
    padding: 8px 16px;
    border: 1px solid $color-primary-100;
    border-radius: 100px;
    background-color: transparent;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
