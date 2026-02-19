<script setup lang="ts">
import { ref } from "vue";
import type { Interaction, Profile } from "@/features/chat-onboarding/types.ts";
import InteractionTyping from "@/features/chat-onboarding/InteractionTyping.vue";
import InteractionAgentMessage from "@/features/chat-onboarding/InteractionAgentMessage.vue";
import InteractionFieldPrompt from "@/features/chat-onboarding/InteractionFieldPrompt.vue";
import InteractionRemovalProgress from "@/features/chat-onboarding/InteractionRemovalProgress.vue";
import InteractionDownloadApp from "@/features/chat-onboarding/InteractionDownloadApp.vue";
import InteractionRemovalConsent from "@/features/chat-onboarding/InteractionRemovalConsent.vue";
import InteractionUsernameReminder from "@/features/chat-onboarding/InteractionUsernameReminder.vue";
import InteractionSingleSelect from "@/features/chat-onboarding/InteractionSingleSelect.vue";
import InteractionMultiSelect from "@/features/chat-onboarding/InteractionMultiSelect.vue";

type ChatOnboardingInteractionProps = {
  interaction: Interaction;
};

defineProps<ChatOnboardingInteractionProps>();
const emit = defineEmits(["complete", "resize"]);

const profile = defineModel<Profile>("profile", { required: true });
const removalProgress = defineModel<number>("removalProgress", {
  required: true,
});

const isTyping = ref(true);

const onResize = () => emit("resize");
</script>

<template>
  <InteractionTyping
    v-if="isTyping"
    :interaction="interaction"
    @complete="isTyping = false"
    @resize="onResize"
  />
  <InteractionAgentMessage
    v-else-if="interaction.type === 'agentMessage'"
    :interaction="interaction"
    @complete="$emit('complete', $event)"
    @resize="onResize"
  />
  <InteractionRemovalConsent
    v-else-if="interaction.type === 'removalConsent'"
    :interaction="interaction"
    @complete="$emit('complete', $event)"
    @resize="onResize"
  />
  <InteractionFieldPrompt
    v-else-if="interaction.type === 'fieldPrompt'"
    v-model:profile="profile"
    :interaction="interaction"
    @complete="$emit('complete', $event)"
    @resize="onResize"
  />
  <InteractionRemovalProgress
    v-else-if="interaction.type === 'removalProgress'"
    v-model:removal-progress="removalProgress"
    :interaction="interaction"
    @complete="$emit('complete', $event)"
    @resize="onResize"
  />
  <InteractionUsernameReminder
    v-else-if="interaction.type === 'usernameReminder'"
    :interaction="interaction"
    @complete="$emit('complete', $event)"
    @resize="onResize"
  />
  <InteractionDownloadApp
    v-else-if="interaction.type === 'downloadApp'"
    :interaction="interaction"
    @complete="$emit('complete', $event)"
    @resize="onResize"
  />
  <InteractionSingleSelect
    v-else-if="interaction.type === 'singleSelect'"
    :interaction="interaction"
    @complete="$emit('complete', $event)"
    @resize="onResize"
  />
  <InteractionMultiSelect
    v-else-if="interaction.type === 'multiSelect'"
    :interaction="interaction"
    @complete="$emit('complete', $event)"
    @resize="onResize"
  />
</template>
