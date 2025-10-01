<script setup>
import store from "@/store";
import {
  countries,
  countryConfig,
  getUserCountry,
} from "@/scripts/countries/countries";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";

import { computed } from "vue";

const emit = defineEmits(["update", "save"]);

const props = defineProps({
  current: {
    type: Object,
    default: () => ({}),
  },
});

const userCountry = computed(() =>
  getUserCountry(store.state.authentication?.user)
);
const location = computed(() => {
  return isNotEmpty(props.current) && props.current;
});

const countryNames = computed(() => {
  return countries(store.state.authentication?.user).map((o) => o.name);
});

const currentCountry = computed(() => props.current?.autofill_country);

const currentCountryConfig = computed(() => {
  if (currentCountry.value) {
    return Object.values(countryConfig).filter(
      (o) => o.name === currentCountry.value
    )?.[0];
  }
  return countryConfig[userCountry.value];
});

const stateOrProvinceNames = computed(() => {
  if (currentCountryConfig.value?.addressLevelOneList) {
    return currentCountryConfig.value.addressLevelOneList.map((o) => o.label);
  }
  return [];
});

const stateOrProvinceLabel = computed(() => {
  if (currentCountryConfig.value?.addressLevelOneLabel) {
    return currentCountryConfig.value.addressLevelOneLabel;
  }
  return "Province / Territory";
});

function isNotEmpty(address) {
  return (
    address.autofill_street_address ||
    address.autofill_unit ||
    address.autofill_country ||
    address.autofill_address_level1 ||
    address.autofill_address_level2 ||
    address.autofill_postal_code
  );
}

function value(field) {
  if (location.value) {
    return location.value[field];
  }
  return null;
}
function handleUpdateValue({ name, value }) {
  emit("update", { name, value });
}
</script>

<template>
  <section @click="$event.stopPropagation()">
    <div
      ref="openAddressRef"
      class="edit-address"
    >
      <PreferencesInput
        label="Country"
        :options="countryNames"
        :value="value('autofill_country')"
        :readonly="true"
        @save="emit('save')"
        @option="
          (value) => {
            handleUpdateValue({
              name: 'autofill_country',
              value,
            });
            handleUpdateValue({
              name: 'autofill_address_level1',
              value: '',
            });
          }
        "
      />
      <div class="split_row">
        <PreferencesInput
          label="Street"
          :max="175"
          :value="value('autofill_street_address')"
          @save="emit('save')"
          @input="
            (value) =>
              handleUpdateValue({ name: 'autofill_street_address', value })
          "
        />

        <PreferencesInput
          label="Apartment #"
          :value="value('autofill_unit')"
          :max="30"
          @save="emit('save')"
          @input="
            (value) => handleUpdateValue({ name: 'autofill_unit', value })
          "
        />
      </div>

      <div class="split_row">
        <PreferencesInput
          label="City"
          :value="value('autofill_address_level2')"
          :max="50"
          @save="emit('save')"
          @input="
            (value) =>
              handleUpdateValue({ name: 'autofill_address_level2', value })
          "
        />

        <PreferencesInput
          v-if="stateOrProvinceNames.length > 0"
          :label="stateOrProvinceLabel"
          :options="stateOrProvinceNames"
          :value="value('autofill_address_level1')"
          :readonly="true"
          @save="emit('save')"
          @option="
            (value) =>
              handleUpdateValue({ name: 'autofill_address_level1', value })
          "
        />
        <PreferencesInput
          v-else
          :label="stateOrProvinceLabel"
          :value="value('autofill_address_level1')"
          :max="80"
          @save="emit('save')"
          @input="
            (value) =>
              handleUpdateValue({ name: 'autofill_address_level1', value })
          "
        />
        <PreferencesInput
          label="Postal Code"
          :pattern="/^[0-9\s-]+$/"
          :max="11"
          :value="value('autofill_postal_code')"
          @save="emit('save')"
          @input="
            (value) =>
              handleUpdateValue({ name: 'autofill_postal_code', value })
          "
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.edit-address {
  display: flex;
  flex-direction: column;
  gap: 13px;

  .preferences-input {
    margin-top: 0;
  }
}

.split_row {
  display: grid;
  gap: 13px;

  &:nth-child(1) {
    grid-template-columns: 8fr 4fr;
  }

  &:nth-child(2) {
    grid-template-columns: 8fr 4fr;
  }

  &:nth-child(3) {
    grid-template-columns: 4fr 4fr 4fr;
  }
}
</style>
