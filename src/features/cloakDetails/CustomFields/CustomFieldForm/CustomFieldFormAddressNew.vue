<script setup>
import store from "@/store";
import CustomFieldFormWrapper from "@/features/cloakDetails/CustomFields/CustomFieldForm/CustomFieldFormWrapper.vue";
import BorderInputText from "@/features/BorderInputText.vue";
import BorderInputSelect from "@/features/BorderInputSelect.vue";
import CustomFieldFormInputIsSensitive from "@/features/cloakDetails/CustomFields/CustomFieldFormInputIsSensitive.vue";
import CustomFieldAddressIcon from "@/features/cloakDetails/CustomFields/CustomFieldAddressIcon.vue";
import { addressTypes } from "@/features/cloakDetails/CustomFields/CustomFieldForm/utils";
import {
  countries,
  countryConfig,
  getUserCountry,
} from "@/scripts/countries/countries";
import { computed, useAttrs } from "vue";

const attrs = useAttrs();
defineEmits(["input"]);
const userCountry = computed(() =>
  getUserCountry(store.state.authentication?.user)
);
const currentCountry = computed(() => attrs.value?.value?.country);
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
    return currentCountryConfig.value.addressLevelOneList;
  }
  return [];
});

const stateOrProvinceLabel = computed(() => {
  if (currentCountryConfig.value?.addressLevelOneLabel) {
    return currentCountryConfig.value.addressLevelOneLabel;
  }
  return "Province / Territory";
});
</script>

<template>
  <CustomFieldFormWrapper
    class="custom-field-form-address"
    v-bind="$attrs"
  >
    <div class="custom-field-form-address__row">
      <BorderInputSelect
        label="Address type"
        :options="addressTypes"
        :value="$attrs?.value?.value?.type"
        @input="
          $emit('input', {
            ...$attrs?.value,
            value: { ...$attrs?.value?.value, type: $event.value },
          })
        "
      >
        <template #selected-value="{ value, options }">
          {{ options.find((option) => option.value === value).label }}
        </template>
        <template #option="{ option }">
          <span class="custom-field-form-address__type-icon">
            <CustomFieldAddressIcon :type="option.value" />
          </span>
          {{ option.label }}
        </template>
      </BorderInputSelect>
      <BorderInputText
        label="Address label"
        :value="$attrs?.value?.label"
        :max="100"
        @input="$emit('input', { ...$attrs?.value, label: $event })"
      />
    </div>
    <BorderInputSelect
      label="Country"
      placeholder="Select"
      :options="countries(store.state.authentication?.user)"
      :value="$attrs?.value?.value?.country"
      @input="
        (value) => {
          $emit('input', {
            ...$attrs?.value,
            value: { ...$attrs?.value?.value, country: value?.name, state: '' },
          });
        }
      "
    >
      <template #selected-value="{ value, options }">
        {{ options.find((option) => option.name === value).name }}
      </template>
      <template #option="{ option }">
        {{ option.name }}
      </template>
    </BorderInputSelect>
    <BorderInputText
      label="Street"
      :value="$attrs?.value?.value?.street_address"
      :max="175"
      @input="
        $emit('input', {
          ...$attrs.value,
          value: { ...$attrs?.value?.value, street_address: $event },
        })
      "
    />
    <div class="custom-field-form-address__row">
      <BorderInputText
        label="Apartment, suite"
        :value="$attrs?.value?.value?.unit"
        :max="30"
        @input="
          $emit('input', {
            ...$attrs?.value,
            value: { ...$attrs?.value?.value, unit: $event },
          })
        "
      />
      <BorderInputText
        label="City"
        :value="$attrs?.value?.value?.city"
        :max="50"
        @input="
          $emit('input', {
            ...$attrs?.value,
            value: { ...$attrs?.value?.value, city: $event },
          })
        "
      />
    </div>
    <div class="custom-field-form-address__row">
      <BorderInputSelect
        v-if="stateOrProvinceNames.length > 0"
        :label="stateOrProvinceLabel"
        placeholder="Select"
        :options="stateOrProvinceNames"
        :value="$attrs?.value?.value?.state"
        @input="
          $emit('input', {
            ...$attrs?.value,
            value: { ...$attrs?.value?.value, state: $event.value },
          })
        "
      >
        <template #selected-value="{ value, options }">
          {{ options.find((option) => option.value === value).label }}
        </template>
        <template #option="{ option }">
          {{ option.label }}
        </template>
      </BorderInputSelect>
      <BorderInputText
        v-else
        :label="stateOrProvinceLabel"
        :value="$attrs?.value?.value?.state"
        :max="50"
        @input="
          $emit('input', {
            ...$attrs.value,
            value: { ...$attrs?.value?.value, state: $event },
          })
        "
      />
      <BorderInputText
        label="Postal code"
        :value="$attrs?.value?.value?.postal_code"
        :max="11"
        @input="
          $emit('input', {
            ...$attrs?.value,
            value: { ...$attrs?.value?.value, postal_code: $event },
          })
        "
      />
    </div>
    <CustomFieldFormInputIsSensitive
      :value="!!attrs?.value?.isSecret"
      @input="$emit('input', { ...attrs?.value, isSecret: $event })"
    />
  </CustomFieldFormWrapper>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.custom-field-form-address {
  &__row {
    display: flex;
    gap: 12px;

    & > * {
      flex: 1;
    }
  }

  &__type-icon {
    flex-shrink: 0;
    margin-right: 8px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;

    .custom-field-address-icon {
      // fix color override
      color: $color-primary-50;
    }
  }
}
</style>
