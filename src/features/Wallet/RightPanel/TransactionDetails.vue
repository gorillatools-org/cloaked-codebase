<script setup>
import { computed, markRaw } from "vue";
import store from "@/store";
import InformationHeader from "./InformationHeader.vue";
import DetailSection from "./DetailSection.vue";
import moment from "moment";
import TransactionNoteModal from "@/features/Wallet/RightPanel/TransactionNoteModal.vue";

const transaction = computed(() => {
  return store.state.cards.rightPanel?.transaction;
});

const date = computed(() => {
  return moment(transaction.value.created_at).format("MMMM DD, YYYY, h:mm A");
});

function openNoteModal() {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(TransactionNoteModal),
      props: {
        isVisible: true,
        maxlength: 10000,
      },
    },
  });
}
</script>

<template>
  <div>
    <InformationHeader :transaction="transaction" />

    <div class="details">
      <DetailSection
        :title="date"
        icon="calendar"
      />

      <DetailSection
        title="Description"
        :description="transaction.merchant_name || 'N/A'"
        icon="description"
      />

      <DetailSection
        title="Category"
        :description="transaction.merchant_category_name || 'N/A'"
        icon="category"
      />

      <DetailSection
        title="Notes"
        :description="transaction.note"
        icon="edit-pencil-larger"
        link
        @click="openNoteModal"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.details {
  > * {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.cloak-identifier-section__group {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
