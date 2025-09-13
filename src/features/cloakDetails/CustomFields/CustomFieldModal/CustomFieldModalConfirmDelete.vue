<script setup>
import { useAttrs } from "vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import AppModal from "@/features/ui/AppModal.vue";
import BaseButton from "@/library/BaseButton.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["input", "delete"]);

const attrs = useAttrs();
</script>

<template>
  <AppModal v-bind="attrs">
    <AppModalContent>
      <AppModalTitle>
        Are you sure you want to delete this information?
      </AppModalTitle>
      <AppModalParagraph>You will not be able to recover it.</AppModalParagraph>
      <AppModalFooter>
        <BaseButton
          variant="secondary"
          @click="$emit('input', false)"
        >
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          background-color="danger"
          :loading="isLoading"
          @click="$emit('delete')"
        >
          Yes, delete
        </BaseButton>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>
