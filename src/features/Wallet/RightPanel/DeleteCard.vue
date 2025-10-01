<script setup lang="ts">
import BaseButton from "@/library/BaseButton.vue";

const emit = defineEmits<{
  (e: "showDeleteModal"): void;
}>();

const props = defineProps<{
  loading: boolean;
}>();
</script>

<template>
  <div>
    <BaseButton
      size="lg"
      variant="primary"
      background-color="danger"
      full-width
      :loading="props.loading"
      :disabled="props.loading"
      @click="emit('showDeleteModal')"
    >
      Cancel Virtual Card
    </BaseButton>
  </div>
</template>
