<script setup lang="ts">
import CloakedLogoIcon from "@/assets/images/CloakedLogoIcon.svg";
import BaseButton from "@/library/BaseButton.vue";
import { useDisplay } from "@/composables/useDisplay";
import { useRouter } from "vue-router";
import { posthogCapture } from "@/scripts/posthog";
import { useDeepLink } from "@/composables/useDeeplink.ts";
import store from "@/store/index";
import { computed } from "vue";

const { isMobile } = useDisplay();

const router = useRouter();

const { openDownloadAppDeepLink } = useDeepLink();
const username = computed(() => store.getters["authentication/getUsername"]);

const onDownloadApp = async () => {
  posthogCapture("user_clicked_chat_onboarding_skip_to_the_app");
  await router.push({ name: "Home" });

  if (isMobile.value) {
    await openDownloadAppDeepLink(username.value);
  }
};
</script>

<template>
  <header class="chat-header">
    <div class="chat-header__content">
      <CloakedLogoIcon class="chat-header__logo" />
      <BaseButton
        variant="outline"
        size="lg"
        @click="onDownloadApp"
      >
        Skip to the app
      </BaseButton>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.chat-header {
  width: 100%;
  background-color: $color-base-white-10-light;
  backdrop-filter: blur(20px);

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: auto;
    max-width: 550px;
  }

  &__logo {
    height: 32px;
    width: auto;
  }
}
</style>
