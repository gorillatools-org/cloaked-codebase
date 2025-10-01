<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import Button from "@/features/Button.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";

const { isCancellingInvite, cancelInvite } = useInvites();

const props = defineProps({
  invite: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["input"]);
const onCancelInvite = async () => {
  await cancelInvite(props.invite.id);
  emit("input", false);
};
</script>

<template>
  <AppModal
    v-bind="$attrs"
    :has-outside-click-close="true"
    @input="$emit('input', $event)"
  >
    <AppModalContent class="modal-cancel-invite">
      <AppModalTitle size="sm">Cancel invite</AppModalTitle>
      <AppModalParagraph>
        Are you sure you want to cancel your invite to
        <span class="modal-cancel-invite__email">
          {{ invite?.recipient_email }}
        </span>
        <span>?</span>
      </AppModalParagraph>
      <AppModalFooter>
        <Button @click="onCancelInvite">
          <template v-if="isCancellingInvite">
            Cancelling invite
            <InlineSvg name="spinner" />
          </template>
          <template v-else>Yes, cancel invite</template>
        </Button>
        <Button
          type="secondary"
          @click="$emit('input', false)"
        >
          Close
        </Button>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.modal-cancel-invite {
  &__email {
    word-break: break-all;
    font-weight: 600;
  }
}
</style>
