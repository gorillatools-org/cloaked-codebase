<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import BaseButton from "@/library/BaseButton.vue";
import AppCard from "@/features/ui/AppCard.vue";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";

const props = defineProps({
  member: {
    type: Object,
    required: true,
  },
});

const { removeMember, isRemovingMember } = useInvites();

const emit = defineEmits(["input"]);
const onRemoveMember = async () => {
  await removeMember(props.member.id);
  emit("input", false);
};
</script>

<template>
  <AppModal
    v-bind="$attrs"
    :has-outside-click-close="true"
    @input="$emit('input', $event)"
  >
    <AppModalContent class="modal-remove-member">
      <AppModalTitle size="sm">Remove member</AppModalTitle>
      <AppModalParagraph>
        By removing this member from your plan, their account will automatically
        downgrade to a limited plan until they purchase a new plan of their own.
      </AppModalParagraph>
      <AppModalParagraph>
        The following email will receive a notification of their removal from
        your couple plan:
      </AppModalParagraph>
      <AppCard
        type="background"
        class="modal-remove-member__card"
      >
        {{ member?.recipient_email }}
      </AppCard>
      <AppModalFooter>
        <BaseButton
          variant="primary"
          background-color="danger"
          :icon="isRemovingMember ? 'spinner' : ''"
          @click="onRemoveMember"
        >
          <template v-if="isRemovingMember">Removing member</template>
          <template v-else>Remove member</template>
        </BaseButton>
        <BaseButton
          variant="secondary"
          @click="$emit('input', false)"
        >
          Cancel
        </BaseButton>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.modal-remove-member {
  &__card {
    margin: 0 32px;
    margin-top: 8px;
    word-break: break-all;
  }
}
</style>
