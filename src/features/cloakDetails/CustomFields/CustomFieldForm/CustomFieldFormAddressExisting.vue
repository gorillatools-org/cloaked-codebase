<script setup>
import CustomFieldFormWrapper from "@/features/cloakDetails/CustomFields/CustomFieldForm/CustomFieldFormWrapper.vue";
import BorderInputSelect from "@/features/BorderInputSelect.vue";
import ButtonAdd from "@/features/ButtonAdd.vue";
import { getCopyValue } from "@/features/cloakDetails/CustomFields/utils";
import { getDefaultLabel } from "@/features/cloakDetails/CustomFields/CustomFieldForm/utils";

defineEmits(["input", "add-new"]);
const getAddressStringValue = (addressObject) => {
  return getCopyValue("address", addressObject);
};
</script>

<template>
  <CustomFieldFormWrapper
    v-bind="$attrs"
    class="custom-field-existing-address"
  >
    <BorderInputSelect
      label="Choose existing address"
      placeholder="Select"
      :options="$attrs?.existingAddresses"
      :value="getAddressStringValue($attrs?.value?.value)"
      dropdown-width="300"
      @input="
        ($event) => {
          $emit('input', {
            ...$attrs.value,
            label: getDefaultLabel('address'),
            value: { ...$event },
          });
        }
      "
    >
      <template #selected-value="{ value }">
        {{ value }}
      </template>
      <template #option="{ option }">
        <span class="custom-field-existing-address__option">
          {{ getAddressStringValue(option) }}
        </span>
      </template>
    </BorderInputSelect>
    <ButtonAdd
      label="Or enter new address"
      @click="$emit('add-new')"
    />
  </CustomFieldFormWrapper>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
@import "@/assets/scss/recursive/_mixins";

.custom-field-existing-address {
  &__option {
    @include line-clamp(1);

    font-size: 13px;
    font-weight: 400;
    color: $color-primary-50;
  }
}
</style>
