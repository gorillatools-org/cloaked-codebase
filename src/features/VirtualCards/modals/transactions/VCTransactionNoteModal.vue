<script setup lang="ts">
import { computed, ref } from "vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import CardsService from "@/api/actions/cards-services";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import { useToast } from "@/composables/useToast";
import VCCloseModalButton from "../VCCloseModalButton.vue";
import useWalletTransaction from "../../composables/useWalletTransaction";

type Props = {
  maxlength: number;
  transactionId: string;
};

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", note: string): void;
}>();

const props = withDefaults(defineProps<Props>(), {
  maxlength: 10000,
});

const { transaction } = useWalletTransaction(() => props.transactionId);
const toast = useToast();

const isSaving = ref(false);
const note = ref(transaction.value?.note || "");

const notesValueChanged = computed(() => {
  return transaction.value?.note !== note.value.trim();
});

function closeModal() {
  store.dispatch("closeModal");
}

async function save() {
  if (!transaction.value) return;

  isSaving.value = true;
  CardsService.patchTransactionNote(props.transactionId, {
    note: note.value,
  })
    .then(() => {
      store.dispatch("updateTransactions", {
        ...transaction.value,
        note: note.value,
      });

      emit("save", note.value);
      closeModal();
    })
    .catch((error) => {
      toast.error(error || "Failed to save note");
    })
    .finally(() => {
      isSaving.value = false;
    });
}
</script>

<template>
  <ModalTemplate
    :show="true"
    :large="true"
    without-header-padding
    without-body-padding
    class="vc-transaction-note-modal"
    @close="closeModal"
  >
    <template #body>
      <VCCloseModalButton
        class="vc-transaction-note-modal__header-close-button"
        @close="closeModal"
      />
      <header class="vc-transaction-note-modal__header">
        <BaseText
          as="h3"
          variant="headline-3-bold"
          class="vc-transaction-note-modal__header-title"
        >
          Transaction Note
        </BaseText>
      </header>
    </template>

    <template #input>
      <textarea
        id="transaction-note-textarea"
        v-model="note"
        class="vc-transaction-note-modal__textarea"
        rows="10"
        cols="50"
        :maxlength="props.maxlength"
        autocomplete="off"
        aria-label="Transaction note"
        @keydown.enter.stop
      />
    </template>
    <template #footer>
      <div class="vc-transaction-note-modal__footer">
        <div class="vc-transaction-note-modal__buttons">
          <Button
            class="vc-transaction-note-modal__btn"
            type="secondary"
            :disabled="isSaving"
            @click="closeModal"
          >
            Cancel
          </Button>
          <Button
            class="vc-transaction-note-modal__btn"
            :loading="isSaving"
            :disabled="isSaving || !notesValueChanged"
            @click="save"
          >
            Save
          </Button>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
$base-padding: 32px;

.vc-transaction-note-modal {
  &__header {
    padding-top: 32px;
    padding-bottom: 8px;
    padding-inline: $base-padding;

    &-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 1;
    }
  }

  &__textarea {
    width: 100%;
    padding: 10px;
    margin-top: 16px;
    border-radius: 4px;
    background: none;
    color: $color-primary-100;
    font-size: 16px;
    resize: none;
    font-family: $global-font;
    outline: none;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    padding: 10px 0;
  }

  &__buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  &__btn {
    font-size: 14px;
    min-width: 100px;
    font-weight: 600;
  }
}
</style>
