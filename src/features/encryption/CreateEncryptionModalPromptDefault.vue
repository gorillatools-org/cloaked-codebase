<script setup>
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import BaseButton from "@/library/BaseButton.vue";

defineEmits(["input", "continue"]);
</script>

<template>
  <AppModalContent width="500px">
    <AppModalTitle>Finish setting up your account</AppModalTitle>
    <AppModalParagraph>
      Set up your account password to keep your information safe. You'll need a
      password to log in and continue. Once it's set, you can use it to access
      your account.
    </AppModalParagraph>
    <AppModalFooter layout="vertical">
      <BaseButton
        variant="primary"
        size="lg"
        @click="$emit('continue')"
      >
        Continue
      </BaseButton>
      <BaseButton
        variant="text"
        size="lg"
        @click="$emit('input', false)"
      >
        Cancel
      </BaseButton>
    </AppModalFooter>
  </AppModalContent>
</template>
