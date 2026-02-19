<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseSelect from "@/library/BaseSelect.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import { useZipCodeValidation } from "@/composables/validation/useZipCodeValidation";
import { countryConfig } from "@/scripts/countries/countries.js";
import { useCountryValidation } from "@/composables/validation/useCountryValidation.js";
import { useStateValidation } from "@/composables/validation/useStateValidation.js";
import { useCityValidation } from "@/composables/validation/useCityValidation";
import { useStreetValidation } from "@/composables/validation/useStreetValidation";

const props = withDefaults(
  defineProps<{
    isLoading?: boolean;
    usOnly?: boolean;
    showSuiteField?: boolean;
  }>(),
  {
    usOnly: false,
    showSuiteField: true,
  }
);

const country = ref<string>("US");
const street = ref<string>("");
const suite = ref<string>("");
const postalCode = ref<string>("");
const city = ref<string>("");
const state = ref<string>("");

const streetTouched = ref(false);
const postalCodeTouched = ref(false);
const cityTouched = ref(false);
const stateTouched = ref(false);

const countrySelectRef = ref<InstanceType<typeof BaseSelect>>();
const streetInputRef = ref<InstanceType<typeof BaseInput>>();
const suiteInputRef = ref<InstanceType<typeof BaseInput>>();
const postcodeInputRef = ref<InstanceType<typeof BaseInput>>();
const cityInputRef = ref<InstanceType<typeof BaseInput>>();
const stateSelectRef = ref<InstanceType<typeof BaseSelect>>();

const countryOptions = computed(() =>
  ["US", "CA"].map((code) => ({
    label: (countryConfig as any)[code].name,
    value: code,
  }))
);

const stateOptions = computed(() =>
  ((countryConfig as any)[country.value]?.addressLevelOneList || []).map(
    (st: { label: string; value: string }) => ({
      label: st.label,
      value: st.value,
    })
  )
);

const { error: countryError, validateDebounced: validateCountryDebounced } =
  useCountryValidation(country, { debounceTimeout: 100 });

const { error: streetError, validate: validateStreet } = useStreetValidation(
  () => street.value,
  { debounceTimeout: 100, isRequired: true }
);

const { error: postalCodeError, validate: validatePostcode } =
  useZipCodeValidation(() => postalCode.value, {
    debounceTimeout: 100,
    isRequired: true,
  });

const { error: cityError, validate: validateCity } = useCityValidation(
  () => city.value,
  { debounceTimeout: 100, isRequired: true }
);

const {
  error: stateError,
  validate: validateState,
  validateDebounced: validateStateDebounced,
} = useStateValidation(state, { debounceTimeout: 100 });

function onZipInput(e: Event & { target: HTMLInputElement }) {
  const input = e.target;
  const raw = input.value || "";
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  const formatted =
    digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5, 9)}` : digits;
  postalCode.value = formatted;
  if (postalCodeError.value) validatePostcode();
}

function getValues() {
  return {
    country: props.usOnly ? "US" : (country.value || "").trim(),
    address1: (street.value || "").trim(),
    address2: (suite.value || "").trim() || null,
    city: (city.value || "").trim(),
    state: (state.value || "").trim(),
    postal_code: (postalCode.value || "").trim(),
  };
}

function setValues(values: Partial<ReturnType<typeof getValues>>) {
  if (values.country !== undefined)
    country.value = props.usOnly ? "US" : values.country || "US";
  if (values.address1 !== undefined) street.value = values.address1 || "";
  if (values.postal_code !== undefined)
    postalCode.value = values.postal_code || "";
  if (values.city !== undefined) city.value = values.city || "";
  if (values.state !== undefined) state.value = values.state || "";
  if (values.address2 !== undefined) suite.value = values.address2 || "";
}

function validate(): boolean {
  validateStreet();
  validatePostcode();
  validateCity();
  validateState();

  // Return true if all fields are valid
  return (
    !countryError.value &&
    !streetError.value &&
    !postalCodeError.value &&
    !cityError.value &&
    !stateError.value &&
    !!country.value &&
    !!street.value &&
    !!postalCode.value &&
    !!city.value &&
    !!state.value
  );
}

function focusNextInput(
  currentField: "country" | "street" | "suite" | "zip" | "city" | "state"
) {
  const nextFieldMap: Record<string, () => void> = {
    country: () => streetInputRef.value?.focus(),
    street: () => {
      if (props.showSuiteField) {
        suiteInputRef.value?.focus();
      } else {
        postcodeInputRef.value?.focus();
      }
    },
    suite: () => postcodeInputRef.value?.focus(),
    zip: () => cityInputRef.value?.focus(),
    city: () => {
      const selectEl = stateSelectRef.value?.$el?.querySelector?.(
        "select"
      ) as HTMLSelectElement | null;
      selectEl?.focus();
    },
    state: () => {
      const selectEl = stateSelectRef.value?.$el?.querySelector?.(
        "select"
      ) as HTMLSelectElement | null;
      selectEl?.blur();
    },
  };

  nextFieldMap[currentField]?.();
}

function focusFirstInvalidInput() {
  const fields: Array<{
    invalid: boolean;
    focus: () => void;
  }> = [
    {
      invalid: !!streetError.value,
      focus: () => streetInputRef.value?.focus(),
    },
    {
      invalid: !!postalCodeError.value,
      focus: () => postcodeInputRef.value?.focus(),
    },
    {
      invalid: !!cityError.value,
      focus: () => cityInputRef.value?.focus(),
    },
    {
      invalid: !!stateError.value,
      focus: () => {
        const selectEl = stateSelectRef.value?.$el?.querySelector?.(
          "select"
        ) as HTMLSelectElement | null;
        selectEl?.focus();
      },
    },
  ];

  const firstInvalid = fields.find((f) => f.invalid);
  nextTick(() => firstInvalid?.focus());
}

// Reset state field when country changes
watch(country, () => {
  if (state.value) {
    stateTouched.value = false;
    stateError.value = null;
  }
  state.value = "";
});

// If usOnly, force US
watch(
  () => props.usOnly,
  (val) => {
    if (val) {
      country.value = "US";
    }
  },
  { immediate: true }
);

defineExpose({ getValues, setValues, validate, focusFirstInvalidInput });
</script>

<template>
  <div class="vc-profile-manual-address-form">
    <div
      v-if="!props.usOnly"
      class="vc-profile-manual-address-form__row"
    >
      <div
        class="vc-profile-manual-address-form__col vc-profile-manual-address-form__col--full"
      >
        <BaseSelect
          ref="countrySelectRef"
          v-model="country"
          :options="countryOptions"
          :error="countryError || undefined"
          title="Country"
          :required-mark="true"
          placeholder="Select a country"
          enterkeyhint="next"
          :disabled="props.usOnly"
          @blur="validateCountryDebounced()"
          @input="validateCountryDebounced()"
          @keydown.enter.prevent="focusNextInput('country')"
        >
          <template #right>
            <BaseIcon
              v-if="!countryError && country && !props.usOnly"
              name="check"
              class="vc-profile-manual-address-form__valid-icon"
            />
          </template>
          <template #after="{ error }">
            <transition name="text-fade">
              <BaseInputFeedback
                v-if="error"
                :message="error as string"
                variant="error"
                class="base-input__feedback"
              />
            </transition>
          </template>
        </BaseSelect>
      </div>
    </div>

    <div class="vc-profile-manual-address-form__row">
      <div
        class="vc-profile-manual-address-form__col vc-profile-manual-address-form__col--full"
      >
        <BaseInput
          ref="streetInputRef"
          v-model="street"
          title="Street address"
          :required-mark="true"
          :error="streetError"
          enterkeyhint="next"
          placeholder="1234 Broadway Ave"
          @blur="
            streetTouched = true;
            validateStreet();
          "
          @input="validateStreet"
          @keydown.enter.prevent="focusNextInput('street')"
        >
          <template #after="{ error }">
            <transition name="text-fade">
              <BaseInputFeedback
                v-if="error"
                :message="error as string"
                variant="error"
                class="base-input__feedback"
              />
            </transition>
          </template>
          <template #right>
            <BaseIcon
              v-if="streetTouched && !streetError && street"
              name="check"
              class="vc-profile-manual-address-form__valid-icon"
            />
          </template>
        </BaseInput>
      </div>
    </div>

    <div
      v-if="props.showSuiteField"
      class="vc-profile-manual-address-form__row"
    >
      <div
        class="vc-profile-manual-address-form__col vc-profile-manual-address-form__col--full"
      >
        <BaseInput
          ref="suiteInputRef"
          v-model="suite"
          title="Suite/Apt"
          enterkeyhint="next"
          placeholder="Apt 16B"
          @keydown.enter.prevent="focusNextInput('suite')"
        >
          <template #right>
            <BaseIcon
              v-if="suite"
              name="check"
              class="vc-profile-manual-address-form__valid-icon"
            />
          </template>
        </BaseInput>
      </div>
    </div>

    <div class="vc-profile-manual-address-form__row">
      <div class="vc-profile-manual-address-form__col">
        <BaseInput
          ref="postcodeInputRef"
          v-model="postalCode"
          title="Zip"
          :required-mark="true"
          :error="postalCodeError"
          maxlength="10"
          inputmode="numeric"
          enterkeyhint="next"
          placeholder="98101"
          @input="onZipInput($event)"
          @blur="
            postalCodeTouched = true;
            validatePostcode();
          "
          @keydown.enter.prevent="focusNextInput('zip')"
        >
          <template #after="{ error }">
            <transition name="text-fade">
              <BaseInputFeedback
                v-if="error"
                :message="error as string"
                variant="error"
                class="base-input__feedback"
              />
            </transition>
          </template>
          <template #right>
            <BaseIcon
              v-if="postalCodeTouched && !postalCodeError && postalCode"
              name="check"
              class="vc-profile-manual-address-form__valid-icon"
            />
          </template>
        </BaseInput>
      </div>
      <div class="vc-profile-manual-address-form__col">
        <BaseInput
          ref="cityInputRef"
          v-model="city"
          title="City"
          :required-mark="true"
          :error="cityError"
          inputmode="text"
          enterkeyhint="next"
          placeholder="Seattle"
          @blur="
            cityTouched = true;
            validateCity();
          "
          @input="validateCity"
          @keydown.enter.prevent="focusNextInput('city')"
        >
          <template #after="{ error }">
            <transition name="text-fade">
              <BaseInputFeedback
                v-if="error"
                :message="error as string"
                variant="error"
                class="base-input__feedback"
              />
            </transition>
          </template>
          <template #right>
            <BaseIcon
              v-if="cityTouched && !cityError && city"
              name="check"
              class="vc-profile-manual-address-form__valid-icon"
            />
          </template>
        </BaseInput>
      </div>
    </div>

    <div class="vc-profile-manual-address-form__row">
      <div
        class="vc-profile-manual-address-form__col vc-profile-manual-address-form__col--full"
      >
        <BaseSelect
          ref="stateSelectRef"
          v-model="state"
          title="State"
          :required-mark="true"
          placeholder="Select state"
          :options="stateOptions"
          :error="stateError || undefined"
          enterkeyhint="done"
          @blur="
            stateTouched = true;
            validateState();
          "
          @input="validateStateDebounced()"
          @keydown.enter.prevent="focusNextInput('state')"
        >
          <template #right>
            <BaseIcon
              v-if="stateTouched && !stateError && state"
              name="check"
              class="vc-profile-manual-address-form__valid-icon"
            />
          </template>
          <template #after="{ error }">
            <transition name="text-fade">
              <BaseInputFeedback
                v-if="error"
                :message="error as string"
                variant="error"
                class="base-select__feedback"
              />
            </transition>
          </template>
        </BaseSelect>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vc-profile-manual-address-form {
  :deep(.base-select__select:disabled) {
    @at-root .theme-dark & {
      background-color: $color-primary-10 !important;
    }
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;

    &:not(:first-child) {
      margin-top: 8px;
    }
  }

  &__col {
    &--full {
      grid-column: 1 / -1;
    }
  }

  &__support-text {
    color: $color-primary-50;
    font-weight: 500;
  }

  &__valid-icon {
    width: 19px;
    height: 19px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: $color-spam-protection;
    color: $color-base-white-100;
  }
}

.text-fade-enter-active {
  transition: all 0.3s ease-in-out;
}

.text-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.text-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  margin-top: 0;
}

.text-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}

.text-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
  margin-top: 4px;
}

.text-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  margin-top: 0;
}
</style>
