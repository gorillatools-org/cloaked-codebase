<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef } from "vue";
import ChatHeader from "@/features/chat-onboarding/utils/ChatHeader.vue";
import ChatOnboardingInteraction from "@/features/chat-onboarding/ChatOnboardingInteraction.vue";
import type {
  ChatScript,
  FieldType,
  Interaction,
  Profile,
} from "@/features/chat-onboarding/types.ts";
import { posthogCapture } from "@/scripts/posthog";

type ChatOnboardingProps = {
  script: ChatScript;
  autofill: Profile;
  isReady: boolean;
};

const props = defineProps<ChatOnboardingProps>();
const emit = defineEmits(["enroll", "complete", "email-confirmed"]);

const profile = defineModel<Profile>("profile", { required: true });

const remainingInteractions = ref<ChatScript>([...props.script]);
const scriptProgress = ref<ChatScript>([]);
const removalProgress = ref<number>(0);

const shouldEnroll = computed(() => {
  const requiredFields: FieldType[] = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "phone",
    "email",
    "address",
  ];

  return requiredFields.every((field) =>
    props.script.find(
      (interaction) =>
        interaction.type === "fieldPrompt" && interaction.fields.includes(field)
    )
  );
});

const onNext = (completedInteraction: Interaction) => {
  if (
    completedInteraction?.type === "fieldPrompt" &&
    completedInteraction?.fields.includes("email")
  ) {
    emit("email-confirmed", profile.value.email);
  }

  if (completedInteraction?.type === "fieldPrompt") {
    completedInteraction.fields.forEach((field) => {
      posthogCapture("user_submitted_chat_onboarding_field", {
        field,
      });
    });
  }

  if (
    completedInteraction?.type === "fieldPrompt" &&
    remainingInteractions.value.every(
      (interaction) => interaction.type !== "fieldPrompt"
    ) &&
    shouldEnroll.value
  ) {
    emit("enroll");
  }

  const nextInteraction = remainingInteractions.value.shift();

  if (nextInteraction) {
    scriptProgress.value.push(nextInteraction);
  } else {
    emit("complete");
  }
};

onMounted(onNext);

const chat = useTemplateRef("chat");
const minHeight = ref(0);

const isNearBottom = (threshold = window.innerHeight / 3) => {
  const el = document.documentElement;

  const scrollTop = el.scrollTop;
  const viewportHeight = window.innerHeight;
  const fullHeight = el.scrollHeight;

  return fullHeight - (scrollTop + viewportHeight) <= threshold;
};

const onResize = async () => {
  const shouldScroll = isNearBottom();
  await nextTick();

  if (shouldScroll) {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }

  const chatElement = chat.value;

  if (chatElement) {
    const { offsetHeight } = chatElement;

    if (offsetHeight > minHeight.value) {
      minHeight.value = offsetHeight;
    }
  }
};
</script>

<template>
  <div class="chat-onboarding">
    <ChatHeader class="chat-onboarding__header" />
    <div
      v-if="isReady"
      ref="chat"
      class="chat-onboarding__chat"
      :style="{ minHeight: `${minHeight}px` }"
    >
      <ChatOnboardingInteraction
        v-for="(interaction, key) in scriptProgress"
        :key="key"
        v-model:profile="profile"
        v-model:removal-progress="removalProgress"
        :interaction="interaction"
        @complete="onNext"
        @resize="onResize"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-onboarding {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  &__header {
    padding: 16px;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  &__chat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 0 16px 16px;
    width: 100%;
    max-width: 550px;
  }

  // custom input styles
  :deep(.base-input__title),
  :deep(.base-select__title) {
    color: $color-base-black-70;
  }

  :deep(.base-input__action) {
    color: $color-base-black-100;
  }

  :deep(.base-input:has(.base-input__input:disabled) .base-input__action),
  :deep(.base-select:has(.base-select__select:disabled) .base-select__chevron) {
    color: $color-base-black-20;
  }

  :deep(.base-input__input),
  :deep(.base-select__select) {
    background-color: $color-base-black-5;
    border: 1px solid $color-base-black-5;
    color: $color-base-black-100;
    opacity: 1;

    &::placeholder {
      color: $color-base-black-20;
    }

    &:hover {
      border: 1px solid $color-base-black-10;
    }

    &:active,
    &:focus {
      border: 1px solid $color-base-black-70;
    }

    &:disabled {
      background-color: $color-base-black-5;
      border: 1px solid $color-base-black-5;
      color: $color-base-black-20;

      &::placeholder {
        color: $color-base-black-20;
      }
    }
  }

  :deep(.base-input__input--error),
  :deep(.base-select__select--error) {
    border-color: $color-alert;

    &:hover,
    &:active,
    &:focus {
      border-color: $color-alert;
    }
  }
}
</style>
