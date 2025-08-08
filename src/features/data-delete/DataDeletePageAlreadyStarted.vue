<script setup>
import { AF_SIGNUP_URL } from "@/scripts/constants";
import OnboardingPageLogo from "@/features/onboarding/page/OnboardingPageLogo.vue";
import BaseButton from "@/library/BaseButton.vue";
import router from "@/routes/router";
import { isMobileDevice } from "@/scripts/regex";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

function navToApp() {
  if (isMobileDevice) {
    return window.open(AF_SIGNUP_URL, "_blank");
  }
  return router.push({ name: "login" });
}

const { isMobile } = useDisplay();
</script>

<template>
  <div class="data-delete__page flex-col">
    <header class="auth-header">
      <OnboardingPageLogo class="auth-header__logo" />
    </header>
    <img
      src="@/assets/images/data-delete/account-avatar.webp"
      class="monitoring-icon"
      alt="Cloaked Avatar"
      width="300"
      height="174"
    />
    <BaseText
      as="h1"
      :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
      class="data-delete__title"
    >
      Your data removal is already in progress
    </BaseText>
    <BaseText
      as="h2"
      variant="headline-6-medium"
      class="data-delete__text"
    >
      Data removal is already in progress for this phone number. You can see all
      the details and track your progress by signing in to the Cloaked app.
    </BaseText>
    <BaseButton
      variant="primary"
      size="lg"
      class="navto-app-button"
      :class="{ 'is-mobile': isMobileDevice }"
      icon="arrow-long-right"
      @click="navToApp"
    >
      Take me to the Cloaked app
    </BaseButton>
  </div>
</template>
<style lang="scss" scoped>
.flex-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  gap: 14px;
  text-align: center;
  padding: 16px;
  height: 100vh;
  width: 100vw;
  max-width: 500px;
  align-self: center;
}

.auth-header {
  position: fixed;
  top: 0;
  left: 0;
  padding: 32px;
}

.navto-app-button {
  margin: 16px;
  margin-top: 18px;

  &.is-mobile {
    width: calc(100% - 32px);
    position: fixed;
    bottom: 16px;
  }
}

.monitoring-icon {
  width: 205px;
  height: auto;
  filter: drop-shadow(0 7px 26px rgb(0 0 0 / 20%));
}

@media (width <= 768px) {
  .monitoring-icon {
    width: 150px;
  }
}
</style>
