<script setup>
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModal from "@/features/ui/AppModal.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import BaseButton from "@/library/BaseButton.vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);
</script>

<template>
  <AppModal
    :value="props.value"
    @close="emit('close')"
  >
    <AppModalContent class="data-delete-agreement-modal">
      <AppModalTitle>Cloaked Data Deletion Agency Agreement</AppModalTitle>
      <AppModalParagraph>
        I, {{ props.name?.length ? props.name + ", " : "" }}hereby appoint
        Cloaked, Inc., (the 'Agent'), to perform necessary steps to exercise, as
        my agent, rights under applicable privacy legislation ('Privacy Laws')
        and submit requests for exercising of those rights, including but not
        limited to:
        <ul class="data-delete-agreement-modal__list">
          <li class="data-delete-agreement-modal__list-item">
            To seek deletion of my personal data and/or identifiable
            information, and I am submitting this request on my own behalf only;
          </li>
          <li class="data-delete-agreement-modal__list-item">
            To withdraw consent previously provided regarding the processing of
            my personal data and/or identifiable information;
          </li>
          <li class="data-delete-agreement-modal__list-item">
            To object to processing of personal data or identifiable information
            concerning me, including but not limited, to targeted marketing; and
          </li>
          <li class="data-delete-agreement-modal__list-item">
            That my information will be sent to third-party data brokers and
            associated parties for purposes of searching for and deleting my
            data, with the ultimate ability to delete my data being subject to
            such third-party site(s) approving and deleting my data.
          </li>
        </ul>

        <strong class="data-delete-agreement-modal__strong">
          I agree and acknowledge that:
        </strong>
        <ul class="data-delete-agreement-modal__list">
          <li class="data-delete-agreement-modal__list-item">
            the appointed Agent may withdraw representation at its sole
            discretion;
          </li>
          <li class="data-delete-agreement-modal__list-item">
            I am making this authorization form and on behalf of, myself only;
          </li>
          <li class="data-delete-agreement-modal__list-item">
            this Authorization form will terminate with respect to any person
            against which my rights under the Privacy Laws are being exercised,
            once that particular legal or natural person satisfies the request
            submitted by the Agent.
          </li>
        </ul>
      </AppModalParagraph>
      <AppModalFooter class="app-modal-agmt-footer">
        <BaseButton
          variant="primary"
          size="lg"
          class="data-delete-agreement-modal__agree"
          full-width
          @click="emit('close', true)"
        >
          Got it
        </BaseButton>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-agreement-modal {
  &.app-modal-content {
    max-height: calc(100vh - 24px * 2);
    width: calc(100vw - 24px * 2) !important;
    max-width: 740px;
    overflow: auto;

    @media (width <= 900px) {
      max-height: 70vh;
      width: calc(100vw - 24px * 2) !important;
    }
  }

  &__list {
    margin: 20px 0;
    list-style-type: disc;
    padding: 0 0 0 20px;

    &:last-child {
      margin-bottom: 100px;
    }
  }

  &__strong {
    font-weight: 600;
  }
}

.app-modal-agmt-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>
