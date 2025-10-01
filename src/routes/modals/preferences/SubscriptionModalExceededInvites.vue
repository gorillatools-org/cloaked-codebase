<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import BaseButton from "@/library/BaseButton.vue";
import { SUPPORT_EMAIL } from "@/scripts/constants";

defineEmits(["input"]);
</script>

<template>
  <AppModal @input="$emit('input', $event)">
    <AppModalContent class="modal-exceeded-invites">
      <AppModalTitle size="sm">30 day waiting period</AppModalTitle>
      <AppModalParagraph>
        To prevent account abuse, we place a hold on adding new members to a
        plan once one has been removed. If you would like this hold lifted
        sooner, please reach out to
        <a
          :href="`mailto:${SUPPORT_EMAIL}`"
          target="_blank"
          class="modal-exceeded-invites__link"
        >
          {{ SUPPORT_EMAIL }}.
        </a>
      </AppModalParagraph>
      <AppModalFooter>
        <BaseButton
          variant="primary"
          @click="$emit('input', false)"
        >
          Got it
        </BaseButton>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.modal-exceeded-invites {
  &__link {
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
