<script setup>
import { computed, ref, reactive } from "vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import AtomInput from "@/library/AtomInput.vue";
import AtomInputDropdown from "@/library/AtomInputDropdown.vue";
import AtomTagButton from "@/library/AtomTagButton.vue";
import Button from "@/features/Button.vue";
import AtomMultipleInputRow from "@/library/AtomMultipleInputRow.vue";
import SettingsDataRemovalFormWrapper from "@/features/Settings/SettingsDataRemovalFormWrapper.vue";
import BaseText from "@/library/BaseText.vue";

import {
  countryConfig,
  LAUNCHED_COUNTRIES,
  COUNTRY_VALUE_ABREV_MAP,
} from "@/scripts/countries/countries.js";

import { useToast } from "@/composables/useToast.js";
const toast = useToast();

const props = defineProps({
  fullProfile: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["showConfirmationModal", "updateProfile"]);

const inputFieldAddress = reactive({
  city: "",
  state: "",
  country: "United States",
  address1: "",
  address2: "",
  postal_code: "",
});

const addressErrors = ref([]);

const isAddressFormDisabled = computed(() => {
  return [
    inputFieldAddress.city,
    inputFieldAddress.state,
    inputFieldAddress.country,
    inputFieldAddress.address1,
    inputFieldAddress.address2,
    inputFieldAddress.postal_code,
  ].every((address) => !address);
});

const supportedCountries = computed(() =>
  LAUNCHED_COUNTRIES.map((abbrev) => countryConfig[abbrev]?.name)
);

const currentOrDefaultCountry = computed(() => {
  return inputFieldAddress.country || "United States";
});

const statesOrProvinces = computed(() => {
  const abbrev = COUNTRY_VALUE_ABREV_MAP[currentOrDefaultCountry.value];
  return countryConfig[abbrev]?.addressLevelOneList.map((state) => state.label);
});

const stateLabel = computed(() => {
  let country = inputFieldAddress.country;
  if (!country) {
    country = "United States"; // default to show US states
  }

  const abbrev = COUNTRY_VALUE_ABREV_MAP[country];
  return countryConfig[abbrev]?.addressLevelOneLabel;
});

const allAddresses = computed(() => {
  return props.fullProfile?.addresses?.map((addressObj) => {
    let addressParts = [];

    if (addressObj.address1) {
      addressParts.push(addressObj.address1.toLowerCase());
    }
    if (addressObj.address2) {
      addressParts.push(addressObj.address2.toLowerCase());
    }
    if (addressObj.city) {
      addressParts.push(addressObj.city.toLowerCase());
    }
    if (addressObj.state) {
      addressParts.push(addressObj.state.toUpperCase());
    }
    if (addressObj.postal_code) {
      addressParts.push(addressObj.postal_code);
    }
    if (addressObj.country) {
      addressParts.push(addressObj.country.toUpperCase());
    }

    return addressParts.join(", ");
  });
});

function saveAddress() {
  addressErrors.value = [];
  if (
    !inputFieldAddress?.city ||
    !inputFieldAddress?.state ||
    (!inputFieldAddress?.postal_code && inputFieldAddress.country === "Canada")
  ) {
    if (!inputFieldAddress?.city) {
      addressErrors.value = [...addressErrors.value, "city"];
    }
    if (!inputFieldAddress?.state) {
      addressErrors.value = [...addressErrors.value, "state"];
    }
    if (
      inputFieldAddress.country === "Canada" &&
      !inputFieldAddress?.postal_code
    ) {
      addressErrors.value = [...addressErrors.value, "postal_code"];
    }
    return;
  }
  addressErrors.value = [];

  const fullProfileCopy = { ...props.fullProfile };

  const countryAbbrev = COUNTRY_VALUE_ABREV_MAP[currentOrDefaultCountry.value];
  const stateAbbrev = countryConfig[countryAbbrev]?.addressLevelOneList.find(
    (state) => state.label === inputFieldAddress.state
  )?.value;

  const newAddressObject = {
    city: inputFieldAddress.city ? inputFieldAddress.city : undefined,
    state: stateAbbrev ? stateAbbrev : undefined,
    country: inputFieldAddress.country ? countryAbbrev : undefined,
    address1: inputFieldAddress.address1
      ? inputFieldAddress.address1
      : undefined,
    address2: inputFieldAddress.address2
      ? inputFieldAddress.address2
      : undefined,
    postal_code: inputFieldAddress.postal_code
      ? inputFieldAddress.postal_code
      : undefined,
  };

  fullProfileCopy.addresses = [...fullProfileCopy.addresses, newAddressObject];

  return DataDeleteService.updateEnrollmentProfile(fullProfileCopy)
    .then(() => {
      inputFieldAddress.city = "";
      inputFieldAddress.state = "";
      inputFieldAddress.country = "";
      inputFieldAddress.address1 = "";
      inputFieldAddress.address2 = "";
      inputFieldAddress.postal_code = "";
      emit("updateProfile", fullProfileCopy);
      toast.success("Address added successfully");
    })
    .catch(() => {
      toast.error("Failed to add address");
    });
}

function handleCountryInput(event) {
  if (inputFieldAddress.country !== event) {
    inputFieldAddress.state = "";
  }
  inputFieldAddress.country = event;
}

function handleInput(event, field) {
  addressErrors.value = [...addressErrors.value].filter(
    (error) => error !== field
  );
  inputFieldAddress[field] = event?.target?.value;
}

function handleStateInput($event) {
  addressErrors.value = [...addressErrors.value].filter(
    (error) => error !== "state"
  );
  inputFieldAddress.state = $event;
}
</script>
<template>
  <SettingsDataRemovalFormWrapper>
    <template #header>
      <BaseText
        as="h1"
        variant="headline-4-bold"
      >
        Address
      </BaseText>
      <Button
        type="primary"
        class="save-button"
        :disabled="isAddressFormDisabled"
        @click="saveAddress"
      >
        Add address
      </Button>
    </template>
    <AtomInputDropdown
      label="Country"
      :options="supportedCountries"
      :value="inputFieldAddress.country"
      @select="handleCountryInput"
    />
    <AtomMultipleInputRow>
      <AtomInput
        label="Address"
        placeholder="Address"
        type="address"
        :value="inputFieldAddress.address1"
        @input="inputFieldAddress.address1 = $event.target.value"
      />
      <AtomInput
        class="address-2-input"
        label="Suite/Apt"
        placeholder="Suite/Apt"
        type="address"
        :value="inputFieldAddress.address2"
        @input="inputFieldAddress.address2 = $event.target.value"
      />
    </AtomMultipleInputRow>
    <AtomMultipleInputRow>
      <AtomInput
        :label="`Zip code${
          inputFieldAddress.country === 'Canada' ? ' (required)' : ''
        }`"
        placeholder="Zip code"
        type="address"
        :error="addressErrors.includes('postal_code')"
        :value="inputFieldAddress.postal_code"
        @input="handleInput($event, 'postal_code')"
      />
      <AtomInput
        label="City (required)"
        placeholder="City"
        type="address"
        :error="addressErrors.includes('city')"
        :value="inputFieldAddress.city"
        @input="handleInput($event, 'city')"
      />
    </AtomMultipleInputRow>
    <AtomInputDropdown
      :label="`${stateLabel} (required)`"
      :options="statesOrProvinces"
      :value="inputFieldAddress.state"
      :error="addressErrors.includes('state')"
      :maxHeight="'300px'"
      @select="handleStateInput($event)"
    />
    <template #tags>
      <AtomTagButton
        v-for="(address, idx) in allAddresses"
        :key="`${idx}-${address}`"
        icon="close-outline"
        @click="
          emit('showConfirmationModal', {
            field: 'addresses',
            index: idx,
            data: address,
            isFinalItem: allAddresses.length === 1,
          })
        "
      >
        {{ address }}
      </AtomTagButton>
    </template>
  </SettingsDataRemovalFormWrapper>
</template>
<style lang="scss" scoped>
.address-2-input {
  max-width: 157px;
}
</style>
