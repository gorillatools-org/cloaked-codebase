<script setup>
import { computed, ref, reactive } from "vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import CardsService from "@/api/actions/cards-services";
import ModalTemplate from "@/features/ModalTemplate.vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  maxlength: {
    type: Number,
    default: 10000,
  },
});

const state = reactive({
  loading: false,
});

function closeModal() {
  store.dispatch("closeModal");
}

async function save(value) {
  state.loading = true;
  CardsService.patchTransactionNote(transaction.value.id, {
    note: value,
  })
    .then(() => {
      store.dispatch("updateTransactions", {
        ...transaction.value,
        note: value,
      });

      state.loading = false;
      closeModal();
    })
    .catch(() => {
      state.loading = false;
    });
}

const transaction = computed(() => {
  return store.state.cards.rightPanel?.transaction;
});

const inputText = ref(transaction.value.note);

const notesValueChanged = computed(() => {
  return transaction.value.note !== inputText.value;
});
</script>

<template>
  <ModalTemplate
    :show="isVisible"
    :large="true"
    :show-close-in-header="true"
    @close="closeModal"
  >
    <template #header>
      <h1>Transaction Note</h1>
    </template>

    <template #input>
      <textarea
        v-model="transaction.note"
        rows="10"
        cols="50"
        :maxlength="props.maxlength"
        autocomplete="off"
        @keydown.enter.stop
      />
    </template>
    <template #footer>
      <div class="textarea-actions">
        <div class="buttons">
          <Button
            type="secondary"
            :disabled="state.loading"
            @click="closeModal"
          >
            Cancel
          </Button>
          <Button
            :loading="state.loading"
            :disabled="state.loading || !notesValueChanged"
            @click="save(transaction.note)"
          >
            Save
          </Button>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
textarea {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  background: none;
  color: $color-primary-100;
  font-size: 16px;
  resize: none;
  font-family: $global-font;
  outline: none;
}

.textarea-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 10px 0;
}

.buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
</style>
