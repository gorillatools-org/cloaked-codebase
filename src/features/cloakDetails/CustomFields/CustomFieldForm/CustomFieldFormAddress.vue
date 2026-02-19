<script setup>
import { ref, watch } from "vue";
import CustomFieldFormAddressNew from "@/features/cloakDetails/CustomFields/CustomFieldForm/CustomFieldFormAddressNew.vue";
import CustomFieldFormAddressExisting from "@/features/cloakDetails/CustomFields/CustomFieldForm/CustomFieldFormAddressExisting.vue";
import {
  getDefaultLabel,
  getFreshNewAddress,
} from "@/features/cloakDetails/CustomFields/CustomFieldForm/utils";

const props = defineProps({
  formType: {
    type: String,
    validator: (value) => ["new", "edit"].includes(value),
    default: null,
  },
  existingAddresses: {
    type: Array,
    default: () => [],
  },
});

const addingNew = ref(
  props.formType === "edit" || !props.existingAddresses?.length
);

const emit = defineEmits(["input", "reset-validation"]);

const onAddNew = () => {
  emit("input", {
    type: "address",
    label: getDefaultLabel("address"),
    value: getFreshNewAddress(),
    isSecret: false,
  });

  emit("reset-validation");
  addingNew.value = true;
};

watch(
  () => props.formType,
  (value) => {
    value === "edit" && onAddNew();
  },
  { deep: true }
);

watch(
  () => props.existingAddresses,
  (value) => {
    !value?.length || onAddNew();
  },
  { deep: true }
);
</script>

<template>
  <CustomFieldFormAddressNew
    v-if="addingNew"
    v-bind="$attrs"
    @input="$emit('input', $event)"
  />
  <CustomFieldFormAddressExisting
    v-else
    v-bind="$attrs"
    :existing-addresses="existingAddresses"
    @input="$emit('input', $event)"
    @add-new="onAddNew"
  />
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
}
</style>
