<script setup>
import store from "@/store";
import router from "@/routes/router";
import Button from "@/features/Button.vue";
import { computed, ref } from "vue";
import DetailSection from "@/features/Wallet/RightPanel/DetailSection.vue";
import CardsServices from "@/api/actions/cards-services";
import ModalTemplate from "@/features/ModalTemplate.vue";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const downloadingStatementId = ref(null);

function closeModal() {
  store.dispatch("closeModal");
  router.replace("/virtual-cards", undefined, { shallow: true });
}

const statements = computed(() => {
  return store.state.cards?.statements?.results;
});

const statementsEmpty = computed(() => {
  return statements.value.length === 0;
});

const isDownloadingStatement = computed(() => {
  return downloadingStatementId.value !== null;
});

function openStatement(id) {
  if (isDownloadingStatement.value) return;

  downloadingStatementId.value = id;

  CardsServices.getCardStatement(id)
    .then((response) => {
      const base64String = response.data;
      const binaryString = atob(base64String);

      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    })
    .finally(() => {
      downloadingStatementId.value = null;
    });
}
</script>

<template>
  <ModalTemplate
    :show="props.isVisible"
    @close="closeModal"
  >
    <template #header>
      <h2>Statements</h2>
    </template>
    <template #body>
      <p v-if="statementsEmpty">No statements available</p>
      <div
        v-else
        class="statements"
      >
        <DetailSection
          v-for="statement in statements"
          :key="statement.id"
          :title="statement.name"
          :not-clickable="isDownloadingStatement"
          :disabled="
            isDownloadingStatement && downloadingStatementId !== statement.id
          "
          icon="document"
          :hover-effect="true"
          :download="downloadingStatementId !== statement.id"
          :loading="
            isDownloadingStatement && downloadingStatementId === statement.id
          "
          @click="openStatement(statement.id)"
        />
      </div>
    </template>
    <template #footer>
      <Button
        type="secondary"
        @click="closeModal"
      >
        Close
      </Button>
    </template>
  </ModalTemplate>
</template>

<style scoped>
.statements {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
