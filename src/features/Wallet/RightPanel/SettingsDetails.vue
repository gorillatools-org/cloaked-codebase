<script setup>
import { computed, markRaw } from "vue";
import store from "@/store";
import DetailSection from "./DetailSection.vue";
import PatchBillingAddress from "@/features/modals/Wallet/PatchBillingAddress.vue";
import ListStatements from "@/features/modals/Wallet/ListStatements.vue";
import { StateList } from "@/scripts/countries/states";
import { capitalizeFirstLetter } from "@/scripts/format";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";

const toast = useToast();

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
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(ListStatements),
      props: {
        isVisible: true,
      },
    },
  });
}

function exportTransactions() {
  CardsServices.exportTransactions().then((response) => {
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
        multiLine
        notClickable
        copyToClipboard
      />

      <DetailSection
        title="Billing address"
        :description="fullAddress"
        icon="home"
        multiLine
        copyToClipboard
        @toggleClicked="toggleBillingAddressModal"
      />

      <DetailSection
        title="Statements"
        icon="document"
        link
        @toggleClicked="toggleStatementModal"
      />

      <DetailSection
        title="Export transactions"
        icon="list"
        download
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
