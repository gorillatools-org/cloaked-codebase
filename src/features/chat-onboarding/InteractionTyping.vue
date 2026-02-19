<script setup lang="ts">
import { onMounted, ref } from "vue";
import ChatBubble from "@/features/chat-onboarding/utils/ChatBubble.vue";
import type { Interaction } from "@/features/chat-onboarding/types.ts";
import { wait } from "@/features/chat-onboarding/utils.ts";
import { random } from "lodash-es";

type InteractionTypingProps = {
  interaction: Interaction;
};

const props = defineProps<InteractionTypingProps>();
const emit = defineEmits(["complete", "resize"]);

const isVisible = ref(false);

const getInteractionTypingTime = (interaction: Interaction) => {
  if ("text" in interaction && interaction.text) {
    const length = interaction.text.length;
    const time = length * 15;
    return Math.min(2000, time);
  }

  return 1200;
};

onMounted(async () => {
  await wait(random(50, 400));
  isVisible.value = true;
  emit("resize");
  await wait(getInteractionTypingTime(props.interaction));
  emit("complete");
});
</script>

<template>
  <ChatBubble
    v-if="isVisible"
    class="interaction-typing"
  >
    <span class="interaction-typing__dot" />
    <span class="interaction-typing__dot" />
    <span class="interaction-typing__dot" />
  </ChatBubble>
</template>

<style lang="scss" scoped>
.interaction-typing {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 50px;

  &__dot {
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $color-base-black-100;
    opacity: 0.25;
    animation: typing 2s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.1s;
    }

    &:nth-child(3) {
      animation-delay: 0.2s;
    }
  }

  @keyframes typing {
    0% {
      opacity: 0.25;
    }

    15% {
      opacity: 0.5;
      transform: translateY(-5px);
    }

    30% {
      transform: translateY(0);
      opacity: 0.25;
    }
  }
}
</style>
