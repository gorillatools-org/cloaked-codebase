<script setup lang="ts">
import type { DownloadApp } from "@/features/chat-onboarding/types.ts";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import ChatBubble from "@/features/chat-onboarding/utils/ChatBubble.vue";
import CloakedLogoIcon from "@/assets/images/CloakedLogoIcon.svg";
import { computed, onBeforeMount, onMounted } from "vue";
import { useDisplay } from "@/composables/useDisplay";
import { useRouter } from "vue-router";
import { useDeepLink } from "@/composables/useDeeplink.ts";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog";

type InteractionDownloadAppProps = {
  interaction: DownloadApp;
};

const props = defineProps<InteractionDownloadAppProps>();
const emit = defineEmits(["complete", "resize"]);

onBeforeMount(() => emit("resize"));
onMounted(() => emit("complete", props.interaction));

const { isMobile } = useDisplay();

const router = useRouter();

const { openDownloadAppDeepLink } = useDeepLink();
const username = computed(() => store.getters["authentication/getUsername"]);

const onDownloadApp = async () => {
  posthogCapture("user_clicked_chat_onboarding_download_app");
  await router.push({ name: "Home" });

  if (isMobile.value) {
    await openDownloadAppDeepLink(username.value);
  }
};
</script>

<template>
  <ChatBubble
    class="interaction-download-app"
    type="cta"
  >
    <CloakedLogoIcon />
    <BaseText
      variant="headline-3-medium"
      as="p"
      class="interaction-download-app__title"
    >
      {{ interaction.titleText }}
    </BaseText>
    <BaseText
      variant="body-3-regular"
      as="p"
      class="interaction-download-app__text"
    >
      {{ interaction.text }}
    </BaseText>
    <BaseButton
      variant="primary"
      class="interaction-download-app__download"
      full-width
      size="lg"
      @click="onDownloadApp"
    >
      {{ interaction.buttonText }}
    </BaseButton>
  </ChatBubble>
</template>

<style lang="scss" scoped>
.interaction-download-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  &__title {
    margin-top: 10px;
  }

  &__text {
    margin-top: 10px;
    text-align: center;
  }

  &__download {
    margin-top: 16px;
  }

  :deep(.base-button__icon) {
    display: none;
  }
}
</style>
