<script setup lang="ts">
import store from "@/store";
import router from "@/routes/router";
import Button from "@/features/Button.vue";
import { computed, ref } from "vue";
import VCBaseCardDownload from "@/features/VirtualCards/base/card/VCBaseCardDownload.vue";
import CardsServices from "@/api/actions/cards-services";
import ModalTemplate from "@/features/ModalTemplate.vue";
import { useToast } from "@/composables/useToast.js";
import VCBaseCloseModalButton from "@/features/VirtualCards/modals/VCCloseModalButton.vue";
import BaseText from "@/library/BaseText.vue";
import { posthogCapture } from "@/scripts/posthog";

const toast = useToast();
const downloadingStatementId = ref<string | null>(null);

function closeModal() {
  store.dispatch("closeModal");
  router.replace("/virtual-cards/wallet");
}

const statements = computed(() => {
  return store.state.cards?.statements?.results;
});

const isEmpty = computed(() => {
  return !statements.value || statements.value.length === 0;
});

const isDownloading = computed(() => {
  return downloadingStatementId.value !== null;
});

function openStatement(id: string) {
  if (isDownloading.value) return;

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
      posthogCapture(`pay_wallet_statements_modal_download_success`, {
        statement_id: id,
      });
    })
    .catch((error) => {
      toast.error(error.message || "Error downloading statement");
      posthogCapture(`pay_wallet_statements_modal_download_failed`, {
        statement_id: id,
      });
    })
    .finally(() => {
      downloadingStatementId.value = null;
    });
}
</script>

<template>
  <ModalTemplate
    class="vc-list-statements-modal"
    :show="true"
    @close="closeModal"
  >
    <template #header>
      <div class="vc-list-statements-modal__header">
        <BaseText
          as="h2"
          variant="headline-3-bold"
        >
          Statements
        </BaseText>
        <VCBaseCloseModalButton
          class="vc-list-statements-modal__header-close-button"
          @close="closeModal"
        />
      </div>
    </template>
    <template #body>
      <BaseText
        v-if="isEmpty"
        variant="body-2-semibold"
        class="statements-empty"
      >
        No statements available.
      </BaseText>
      <div
        v-else
        class="vc-list-statements-modal__list"
      >
        <div
          v-for="statement in statements"
          :key="statement.id"
          class="vc-list-statements-modal__list-item"
          :class="{
            'vc-list-statements-modal__list-item--disabled':
              downloadingStatementId && downloadingStatementId !== statement.id,
          }"
        >
          <VCBaseCardDownload
            :title="statement.name"
            :disabled="isDownloading && downloadingStatementId !== statement.id"
            icon="document"
            :loading="isDownloading && downloadingStatementId === statement.id"
            @click="openStatement(statement.id)"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <Button
        class="vc-list-statements-modal__footer-close-btn"
        type="secondary"
        @click="closeModal"
      >
        Close
      </Button>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
.vc-list-statements-modal {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__header {
    position: relative;

    &-close-button {
      position: absolute;
      top: -18px;
      right: -18px;
    }
  }

  &__empty-text {
    margin-top: 16px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &-item {
      opacity: 1;
      transition: opacity 0.12s ease-out;

      &--disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }
  }

  &__footer-close-btn {
    font-size: 14px;
    width: 90px;
    font-weight: 600;
  }
}
</style>
