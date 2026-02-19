<script setup>
import { computed, markRaw, ref } from "vue";
import store from "@/store";
import DetailSection from "./DetailSection.vue";
import PatchBillingAddress from "@/features/modals/Wallet/PatchBillingAddress.vue";
import VCWalletStatementsModal from "@/features/VirtualCards/modals/VCWalletStatementsModal.vue";
import { StateList } from "@/scripts/countries/states";
import { capitalizeFirstLetter } from "@/scripts/format";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";
import { posthogCapture } from "@/scripts/posthog.js";

const toast = useToast();
const isFetchingStatements = ref(false);
const isExportingTransactions = ref(false);

const information = computed(() => {
  return store.state.cards?.cardInformation;
});

const stateName = (stateCode) => {
  return StateList.find((state) => state.value === stateCode)?.label;
};

const fullAddress = computed(() => {
  const parts = [
    information.value?.address?.street,
    information.value?.address?.street2,
    information.value?.address?.city,
    stateName(information.value?.address?.state_province),
    information.value?.address?.postcode,
  ];

  const existingParts = parts.filter((part) => !!part);

  return existingParts.join(",\n");
});

function toggleBillingAddressModal() {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(PatchBillingAddress),
      props: {
        isVisible: true,
      },
    },
  });
}

function toggleStatementModal() {
  isFetchingStatements.value = true;
  CardsServices.getStatements()
    .then(() => {
      posthogCapture("pay_wallet_settings_statements_modal_viewed");
      store.dispatch("openModal", {
        customTemplate: {
          template: markRaw(VCWalletStatementsModal),
          props: {
            isVisible: true,
          },
        },
      });
    })
    .finally(() => {
      isFetchingStatements.value = false;
    });
}

function exportTransactions() {
  if (isExportingTransactions.value) return;

  isExportingTransactions.value = true;
  CardsServices.exportTransactions()
    .then((response) => {
      const csvData = response.data;
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "cloaked-pay-transactions.csv");
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Transactions exported successfully");
      posthogCapture(`pay_wallet_settings_export_transactions_success`);
    })
    .catch((error) => {
      toast.error(error.message || "Error exporting transactions");
      posthogCapture(`pay_wallet_settings_export_transactions_failed`);
    })
    .finally(() => {
      isExportingTransactions.value = false;
    });
}
</script>

<template>
  <div>
    <div class="details">
      <DetailSection
        title="Name on card"
        :description="
          capitalizeFirstLetter(information?.first_name) +
          ' ' +
          capitalizeFirstLetter(information?.last_name)
        "
        icon="person-circle"
        multi-line
        not-clickable
        copy-to-clipboard
      />

      <DetailSection
        title="Billing address"
        :description="fullAddress"
        icon="home"
        multi-line
        copy-to-clipboard
        @toggle-clicked="toggleBillingAddressModal"
      />

      <DetailSection
        title="Statements"
        icon="document"
        :style="{ pointerEvents: isFetchingStatements ? 'none' : 'auto' }"
        :link="!isFetchingStatements"
        :loading="isFetchingStatements"
        @toggle-clicked="toggleStatementModal"
      />

      <DetailSection
        title="Export transactions"
        icon="list"
        :style="{ pointerEvents: isExportingTransactions ? 'none' : 'auto' }"
        :download="!isExportingTransactions"
        :loading="isExportingTransactions"
        @click="exportTransactions"
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
</style>
