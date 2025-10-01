<script setup>
import { useAttrs } from "vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import AppModal from "@/features/ui/AppModal.vue";
import Button from "@/features/Button.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";

defineEmits(["input", "discard"]);

const attrs = useAttrs();
</script>

<template>
  <AppModal v-bind="attrs">
    <AppModalContent>
      <AppModalTitle>Unsaved changes</AppModalTitle>
      <AppModalParagraph>You have unsaved changes.</AppModalParagraph>
      <AppModalFooter>
        <Button
          type="secondary"
          @click="$emit('discard')"
        >
          Discard
        </Button>
        <Button @click="$emit('input', false)">Keep editing</Button>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>
