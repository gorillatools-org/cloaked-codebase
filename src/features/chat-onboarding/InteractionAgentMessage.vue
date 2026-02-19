<script setup lang="ts">
import type { AgentMessage } from "@/features/chat-onboarding/types.ts";
import { onBeforeMount, onMounted } from "vue";
import BaseText from "@/library/BaseText.vue";
import ChatBubble from "@/features/chat-onboarding/utils/ChatBubble.vue";

type InteractionAgentMessageProps = {
  interaction: AgentMessage;
};

const props = defineProps<InteractionAgentMessageProps>();

const emit = defineEmits(["complete", "resize"]);

onBeforeMount(() => emit("resize"));
onMounted(() => emit("complete", props.interaction));
</script>

<template>
  <ChatBubble>
    <BaseText
      variant="body-3-regular"
      as="p"
    >
      {{ interaction.text }}
    </BaseText>
  </ChatBubble>
</template>
