<script setup>
import MonitoringSettingsBasicAddresses from "@/features/monitoring/MonitoringSettingsBasicAddresses.vue";
import BaseButton from "@/library/BaseButton.vue";
import { ref } from "vue";
import MonitoringDetailHeaderBack from "@/features/monitoring/MonitoringDetailHeaderBack.vue";
import { useToast } from "@/composables/useToast.js";
import { MAX_ADDRESSES_LIMIT } from "@/scripts/constants";
import BaseText from "@/library/BaseText.vue";

const addresses = defineModel("addresses", { type: Array });

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
  }
};

const onRemoveAddress = (address) => {
  addresses.value = addresses.value.filter((item) => item !== address);
};
</script>

<template>
  <div class="settings-data-removal-addresses">
    <MonitoringDetailHeaderBack to="settings.dataRemoval.all">
      Add Address
    </MonitoringDetailHeaderBack>
    <MonitoringSettingsBasicAddresses
      ref="addressForm"
      v-model:addresses="addresses"
      v-model:country="country"
      v-model:state="state"
      v-model:zip="zip"
      v-model:city="city"
      v-model:street="street"
      v-model:suite="suite"
      class="settings-data-removal-addresses__form"
      @remove-address="onRemoveAddress"
      @add-address="onAddAddress"
    />
    <BaseText
      variant="body-small-medium"
      class="settings-data-removal-addresses__count"
    >
      {{ addresses.length }} of {{ MAX_ADDRESSES_LIMIT }} addresses
    </BaseText>
    <BaseButton
      icon="check"
      size="md"
      full-width
      :disabled="addresses.length >= MAX_ADDRESSES_LIMIT"
      @click="onAddAddress"
      @keydown.enter="onAddAddress"
    >
      {{
        addresses.length >= MAX_ADDRESSES_LIMIT
          ? `Address Limit Reached (${MAX_ADDRESSES_LIMIT})`
          : "Add Address"
      }}
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.settings-data-removal-addresses {
  margin-top: 24px;

  &__form {
    margin-top: 20px;
  }
}
</style>
