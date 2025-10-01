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
    <AppModalTitle>
      Advanced mode requires you create a secure account password
    </AppModalTitle>
    <AppModalParagraph>
      Adding a password will improve your security. Going forward your password
      will be required to log in to your Cloaked account.
    </AppModalParagraph>
    <AppModalFooter layout="vertical">
      <BaseButton
        variant="primary"
        size="lg"
        @click="$emit('continue')"
      >
        Proceed with making a password
      </BaseButton>
      <BaseButton
        variant="text"
        size="lg"
        @click="$emit('input', false)"
      >
        Try Advanced Mode later
      </BaseButton>
    </AppModalFooter>
  </AppModalContent>
</template>
