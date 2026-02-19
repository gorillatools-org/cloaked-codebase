<script setup>
import CreateEncryptionModalPromptAdvancedMode from "@/features/encryption/CreateEncryptionModalPromptAdvancedMode.vue";
import CreateEncryptionModalPromptDefault from "@/features/encryption/CreateEncryptionModalPromptDefault.vue";

defineProps({
  context: {
    type: String,
    required: true,
  },
});

defineEmits(["input", "continue"]);
</script>

<template>
  <CreateEncryptionModalPromptAdvancedMode
    v-if="context === 'advanced-mode'"
    @input="$emit('input', $event)"
    @continue="$emit('continue')"
  />
  <CreateEncryptionModalPromptDefault
    v-else
    @input="$emit('input', $event)"
    @continue="$emit('continue')"
  />
</template>
