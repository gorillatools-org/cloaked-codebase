<script setup>
import { ref } from "vue";
import MonitoringDetailHeader from "@/features/monitoring/MonitoringDetailHeader.vue";
import MonitoringDetailHeaderBack from "@/features/monitoring/MonitoringDetailHeaderBack.vue";
import MonitoringDetailHeaderClose from "@/features/monitoring/MonitoringDetailHeaderClose.vue";
import MonitoringDetailFooter from "@/features/monitoring/MonitoringDetailFooter.vue";
import BaseButton from "@/library/BaseButton.vue";
import MonitoringSettingsBasicAddresses from "@/features/monitoring/MonitoringSettingsBasicAddresses.vue";
import { useToast } from "@/composables/useToast.js";
import { MAX_ADDRESSES_LIMIT } from "@/scripts/constants";

const addresses = defineModel("addresses", { type: Array });

const emit = defineEmits(["back"]);

const country = ref("");
const state = ref("");
const zip = ref("");
const city = ref("");
const street = ref("");
const suite = ref("");

const addressForm = ref(null);
const toast = useToast();

const onAddAddress = () => {
  const isValid = addressForm.value?.validateForm();

  if (isValid) {
    // Check if we're at the limit of 25 addresses
    if (addresses.value.length >= MAX_ADDRESSES_LIMIT) {
      toast.error(
        `You can only add up to ${MAX_ADDRESSES_LIMIT} addresses. Please remove an existing address before adding a new one.`
      );
      return;
    }

    addresses.value.push({
      address1: street.value,
      address2: suite.value,
      city: city.value,
      state: state.value,
      postal_code: zip.value,
      country: country.value,
    });

    street.value = "";
    suite.value = "";
    city.value = "";
    state.value = "";
    zip.value = "";
    country.value = "";

    emit("back");
  }
};

const onRemoveAddress = (address) => {
  addresses.value = addresses.value.filter((item) => item !== address);
};
</script>

<template>
  <div class="page-monitoring-settings-address">
    <MonitoringDetailHeader>
      <MonitoringDetailHeaderBack to="MonitoringSettings">
        Add Address
      </MonitoringDetailHeaderBack>
      <MonitoringDetailHeaderClose to="MonitoringSettings" />
    </MonitoringDetailHeader>
    <MonitoringSettingsBasicAddresses
      ref="addressForm"
      v-model:addresses="addresses"
      v-model:country="country"
      v-model:state="state"
      v-model:zip="zip"
      v-model:city="city"
      v-model:street="street"
      v-model:suite="suite"
      class="page-monitoring-settings-address__form"
      @remove-address="onRemoveAddress"
      @add-address="onAddAddress"
    />
    <MonitoringDetailFooter>
      <BaseButton
        icon="check"
        size="md"
        full-width
        @click="onAddAddress"
        @keydown.enter="onAddAddress"
      >
        Add Address
      </BaseButton>
    </MonitoringDetailFooter>
  </div>
</template>

<style lang="scss" scoped>
.page-monitoring-settings-address {
  display: grid;
  row-gap: 24px;
  position: relative;
  height: 100%;
  grid-template-rows: min-content 1fr;

  &__form {
    margin-top: -18px;
  }
}
</style>
