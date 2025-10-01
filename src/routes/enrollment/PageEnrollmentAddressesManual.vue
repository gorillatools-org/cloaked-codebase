<script setup>
import { computed, onMounted, ref, watch } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import EnrollmentCard from "@/features/enrollment/EnrollmentCard.vue";
import EnrollmentCardHeader from "@/features/enrollment/EnrollmentCardHeader.vue";
import BaseSelect from "@/library/BaseSelect.vue";
import BaseInput from "@/library/BaseInput.vue";
import { countryConfig } from "@/scripts/countries/countries.js";
import { useCountryValidation } from "@/composables/validation/useCountryValidation.js";
import { useStateValidation } from "@/composables/validation/useStateValidation.js";
import { useZipCodeValidation } from "@/composables/validation/useZipCodeValidation.js";
import { useStreetValidation } from "@/composables/validation/useStreetValidation.js";
import { useCityValidation } from "@/composables/validation/useCityValidation.js";
import { posthogCapture } from "@/scripts/posthog.js";

onMounted(() => posthogCapture("user_viewed_enrollment_form_addresses_manual"));

const addresses = defineModel("addresses", { type: Array });

const emit = defineEmits(["back", "complete"]);

defineProps({
  isFullPage: {
    type: Boolean,
    default: true,
  },
});

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

const country = ref("");
const state = ref("");
const zip = ref("");
const city = ref("");
const street = ref("");
const suite = ref("");

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

const onAddAddress = () => {
  const isValid = validateForm();

  if (isValid) {
    addresses.value.push({
      address1: street.value,
      address2: suite.value,
      city: city.value,
      state: state.value,
      postal_code: zip.value,
      country: country.value,
    });

    emit("back");
  }
};

const isAddressValid = computed(() => {
  return (
    street.value && city.value && state.value && country.value && zip.value
  );
});

const isFormValid = computed(() => {
  return (
    isAddressValid.value &&
    !countryError.value &&
    !stateError.value &&
    !zipCodeError.value &&
    !streetError.value &&
    !cityError.value
  );
});

defineExpose({
  isFormValid,
});

watch(
  () => isAddressValid.value,
  () => {
    if (isAddressValid.value && validateForm()) {
      emit("complete", {
        address1: street.value,
        address2: suite.value,
        city: city.value,
        state: state.value,
        postal_code: zip.value,
        country: country.value,
      });
    }
  }
);
</script>

<template>
  <div>
    <EnrollmentCard
      class="page-enrollment-addresses-manual__card"
      :class="{
        'page-enrollment-addresses-manual__card-full-page': isFullPage,
      }"
    >
      <EnrollmentCardHeader
        v-if="isFullPage"
        icon="location-filled"
        class="page-enrollment-addresses-manual__header"
      />
      <BaseText
        v-if="isFullPage"
        as="h2"
        variant="headline-5-bold"
        class="page-enrollment-addresses-manual__title"
      >
        Add Address
      </BaseText>
      <BaseSelect
        v-model="country"
        :options="countryOptions"
        :error="countryError"
        title="Country*"
        placeholder="Select a country"
        class="page-enrollment-addresses-manual__country"
        @blur="validateCountry"
        @input="validateCountryDebounced"
        @keydown.enter="onAddAddress"
      />
      <BaseInput
        v-model="street"
        :error="streetError"
        title="Street Address*"
        placeholder="123 Main St"
        class="page-enrollment-addresses-manual__street"
        @blur="validateStreet"
        @input="validateStreetDebounced"
        @keydown.enter="onAddAddress"
      />
      <BaseInput
        v-model="suite"
        title="Suite/Apt"
        placeholder="Apt 16B"
        class="page-enrollment-addresses-manual__suite"
        @keydown.enter="onAddAddress"
      />
      <BaseInput
        v-model="zip"
        :error="zipCodeError"
        title="Zip Code*"
        placeholder="02109"
        class="page-enrollment-addresses-manual__zip"
        @blur="validateZipCode"
        @input="validateZipCodeDebounced"
        @keydown.enter="onAddAddress"
      />
      <BaseInput
        v-model="city"
        :error="cityError"
        title="City*"
        placeholder="Boston"
        class="page-enrollment-addresses-manual__city"
        @blur="validateCity"
        @input="validateCityDebounced"
        @keydown.enter="onAddAddress"
      />
      <BaseSelect
        v-model="state"
        :options="stateOptions"
        :disabled="!country"
        :error="stateError"
        title="State*"
        placeholder="Select a state"
        :model-value="''"
        class="page-enrollment-addresses-manual__state"
        @blur="validateState"
        @input="validateStateDebounced"
        @keydown.enter="onAddAddress"
      />
    </EnrollmentCard>
    <BaseButton
      v-if="isFullPage"
      icon="check"
      size="md"
      full-width
      class="page-enrollment-addresses-manual__add"
      @click="onAddAddress"
      @keydown.enter="onAddAddress"
    >
      Add Address
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.page-enrollment-addresses-manual {
  &__card {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "country country" "street street" "suite suite" "zip city" "state state";
    align-items: start;

    &-full-page {
      grid-template-areas: "header header" "title title" "country country" "street street" "suite suite" "zip city" "state state";
    }
  }

  &__header {
    grid-area: header;
  }

  &__title {
    grid-area: title;
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

  &__add {
    margin-top: 16px;

    &:focus {
      outline: 1px solid $color-primary-100;
    }
  }
}
</style>
