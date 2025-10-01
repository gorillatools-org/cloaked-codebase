<script setup>
import { computed, watch } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseSelect from "@/library/BaseSelect.vue";
import BaseInput from "@/library/BaseInput.vue";
import EnrollmentTag from "@/features/enrollment/EnrollmentTag.vue";
import EnrollmentTags from "@/features/enrollment/EnrollmentTags.vue";
import { countryConfig } from "@/scripts/countries/countries.js";
import { useCountryValidation } from "@/composables/validation/useCountryValidation.js";
import { useStateValidation } from "@/composables/validation/useStateValidation.js";
import { useZipCodeValidation } from "@/composables/validation/useZipCodeValidation.js";
import { useStreetValidation } from "@/composables/validation/useStreetValidation.js";
import { useCityValidation } from "@/composables/validation/useCityValidation.js";
import { useFormattedAddresses } from "@/features/enrollment/composables.js";

const addresses = defineModel("addresses", { type: Array });
const country = defineModel("country", { type: String });
const state = defineModel("state", { type: String });
const zip = defineModel("zip", { type: String });
const city = defineModel("city", { type: String });
const street = defineModel("street", { type: String });
const suite = defineModel("suite", { type: String });

const formattedAddresses = useFormattedAddresses(addresses);

defineEmits(["remove-address", "add-address"]);

const countryOptions = computed(() =>
  ["US", "CA"].map((countryCode) => ({
    label: countryConfig[countryCode].name,
    value: countryCode,
  }))
);

const stateOptions = computed(() =>
  countryConfig[country.value]?.addressLevelOneList?.map((state) => ({
    label: state.label,
    value: state.value,
  }))
);

watch(country, () => {
  state.value = "";
});

const {
  error: countryError,
  validate: validateCountry,
  validateDebounced: validateCountryDebounced,
} = useCountryValidation(country);

const {
  error: stateError,
  validate: validateState,
  validateDebounced: validateStateDebounced,
} = useStateValidation(state);

const {
  error: zipCodeError,
  validate: validateZipCode,
  validateDebounced: validateZipCodeDebounced,
} = useZipCodeValidation(zip);

const {
  error: streetError,
  validate: validateStreet,
  validateDebounced: validateStreetDebounced,
} = useStreetValidation(street);

const {
  error: cityError,
  validate: validateCity,
  validateDebounced: validateCityDebounced,
} = useCityValidation(city);

const validateForm = () => {
  validateCountry();
  validateState();
  validateZipCode();
  validateStreet();
  validateCity();

  return (
    !countryError.value &&
    !stateError.value &&
    !zipCodeError.value &&
    !streetError.value &&
    !cityError.value
  );
};

defineExpose({ validateForm });
</script>

<template>
  <div class="page-monitoring-settings-address">
    <div class="page-monitoring-settings-address__form">
      <BaseText
        as="h4"
        variant="body-small-medium"
      >
        Please enter your address(es)
      </BaseText>
      <BaseSheet
        spacing-x="sm"
        spacing-y="lg"
        elevation="md"
        class="page-monitoring-settings-address__sheet"
      >
        <BaseSelect
          v-model="country"
          :options="countryOptions"
          :error="countryError"
          title="Country*"
          placeholder="Select a country"
          class="page-monitoring-settings-address__country"
          @blur="validateCountry"
          @input="validateCountryDebounced"
          @keydown.enter="$emit('add-address')"
        />
        <BaseInput
          v-model="street"
          :error="streetError"
          title="Street Address*"
          placeholder="123 Main St"
          class="page-monitoring-settings-address__street"
          @blur="validateStreet"
          @input="validateStreetDebounced"
          @keydown.enter="$emit('add-address')"
        />
        <BaseInput
          v-model="suite"
          title="Suite/Apt"
          placeholder="Apt 16B"
          class="page-monitoring-settings-address__suite"
          @keydown.enter="$emit('add-address')"
        />
        <BaseInput
          v-model="zip"
          :error="zipCodeError"
          title="Zip Code*"
          placeholder="02109"
          class="page-monitoring-settings-address__zip"
          @blur="validateZipCode"
          @input="validateZipCodeDebounced"
          @keydown.enter="$emit('add-address')"
        />
        <BaseInput
          v-model="city"
          :error="cityError"
          title="City*"
          placeholder="Boston"
          class="page-monitoring-settings-address__city"
          @blur="validateCity"
          @input="validateCityDebounced"
          @keydown.enter="$emit('add-address')"
        />
        <BaseSelect
          v-model="state"
          :options="stateOptions"
          :disabled="!country"
          :error="stateError"
          title="State*"
          placeholder="Select a state"
          class="page-monitoring-settings-address__state"
          @blur="validateState"
          @input="validateStateDebounced"
          @keydown.enter="$emit('add-address')"
        />
        <EnrollmentTags class="page-monitoring-settings-address__tags">
          <EnrollmentTag
            v-for="existingAddress in formattedAddresses"
            :key="existingAddress"
            tabindex="0"
            @click="$emit('remove-address', existingAddress.address)"
            @keydown.delete="$emit('remove-address', existingAddress.address)"
          >
            {{ existingAddress.display }}
          </EnrollmentTag>
        </EnrollmentTags>
      </BaseSheet>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.page-monitoring-settings-address {
  display: grid;
  row-gap: 24px;
  position: relative;
  height: 100%;
  grid-template-rows: min-content 1fr;

  &__sheet {
    display: grid;
    row-gap: 16px;
    column-gap: 6px;
    margin-top: 8px;
    align-items: start;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "country country" "street street" "suite suite" "zip city" "state state";
  }

  &__country {
    grid-area: country;
  }

  &__street {
    grid-area: street;
  }

  &__suite {
    grid-area: suite;
  }

  &__zip {
    grid-area: zip;
  }

  &__city {
    grid-area: city;
  }

  &__state {
    grid-area: state;
  }

  &__tags {
    grid-column: 1/3;
  }
}
</style>
