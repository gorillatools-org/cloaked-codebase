<script setup>
import { onMounted, ref, computed } from "vue";
import Button from "./WalletSettingsButton";
import store from "@/store";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";
import { StateList } from "@/scripts/countries/states";
import { capitalizeFirstLetter } from "@/scripts/format";

const toast = useToast();

const information = computed(() => {
  return store.state.cards?.cardInformation;
});

const loading = ref(true);

function getCardInformation() {
  CardsServices.kycRetreive()
    .then(() => {
      setTimeout(() => {
        loading.value = false;
      }, 800);
    })
    .catch(() => {
      toast.error("Error while loading card information");
    });
}

onMounted(() => {
  if (!information.value) {
    getCardInformation();
  } else {
    loading.value = false;
  }
});

function openSettings() {
  store.commit("openSettings");
}

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

  return existingParts.join(", ");
});
</script>

<template>
  <Button
    :loading="loading"
    icon="person-circle"
    text="Cardholder details"
    :title="
      capitalizeFirstLetter(information?.first_name) +
      ' ' +
      capitalizeFirstLetter(information?.last_name)
    "
    :subtext="fullAddress"
    clickable
    @click="openSettings"
  />
</template>
