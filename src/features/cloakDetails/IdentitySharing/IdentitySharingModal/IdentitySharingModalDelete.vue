<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import Button from "@/features/Button.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
const props = defineProps({
  value: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["open-published", "delete", "input"]);
</script>

<template>
  <AppModal
    :value="props.value"
    @input="emit('input', $event)"
  >
    <AppModalContent>
      <AppModalTitle>Are you sure you want to delete this link?</AppModalTitle>
      <AppModalParagraph>
        You will need to generate a new link and password if you want to share
        this identity again.
      </AppModalParagraph>
      <AppModalFooter>
        <Button
          type="secondary"
          @click="$emit('open-published')"
        >
          Cancel
        </Button>
        <Button
          type="danger"
          :loading="props.isLoading"
          @click="$emit('delete')"
        >
          Yes, delete
        </Button>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>
