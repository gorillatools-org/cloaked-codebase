<script setup>
import { computed, onBeforeMount, ref } from "vue";
import CustomFieldFormText from "@/features/cloakDetails/CustomFields/CustomFieldForm/CustomFieldFormText.vue";
import CustomFieldFormAddress from "@/features/cloakDetails/CustomFields/CustomFieldForm/CustomFieldFormAddress.vue";
import {
  getDefaultLabel,
  getFreshNewAddress,
  getValueByStringPath,
  setValueByStringPath,
} from "@/features/cloakDetails/CustomFields/CustomFieldForm/utils";
import {
  hasErrors,
  validationsDate,
  validationsUrl,
} from "@/features/cloakDetails/CustomFields/CustomFieldForm/validations";

const props = defineProps({
  formType: {
    type: String,
    validator: (value) => ["new", "edit"].includes(value),
    default: null,
  },
  fieldType: {
    type: String,
    validator: (value) =>
      [
        "text",
        "address",
        "url",
        "date",
        "bank",
        "auth",
        "identification",
      ].includes(value),
    default: null,
  },
  value: {
    type: Object,
    required: true,
  },
  existingAddresses: {
    type: Array,
    default: () => [],
  },
});

const title = computed(() => {
  const titlePrefix = props.formType === "new" ? "New" : "Edit";

  const typeToTitle = {
    text: `${titlePrefix} custom text`,
    address: `${titlePrefix} address`,
    url: `${titlePrefix} secondary URL`,
    date: `${titlePrefix} date`,
    bank: `${titlePrefix} banking information`,
    auth: `${titlePrefix} authentication key`,
    identification: `${titlePrefix} identification number`,
  };

  return typeToTitle[props.fieldType];
});

const formByFieldType = {
  text: CustomFieldFormText,
  address: CustomFieldFormAddress,
  url: CustomFieldFormText,
  date: CustomFieldFormText,
  bank: CustomFieldFormText,
  auth: CustomFieldFormText,
  identification: CustomFieldFormText,
};

const emit = defineEmits(["input", "save"]);

onBeforeMount(() => {
  if (props.formType === "new") {
    emit("input", {
      type: props.fieldType,
      label: getDefaultLabel(props.fieldType),
      value: props.fieldType === "address" ? getFreshNewAddress() : "",
      isSecret: false,
    });
  }
});

const getFreshValidationErrors = () => ({
  label: [],
  value: [],
});

const errors = ref(getFreshValidationErrors());

const validationsByFieldType = {
  url: validationsUrl,
  date: validationsDate,
};

const validateField = ({ value, field }) => {
  const validationErrors = [];

  const fieldPath = field.split(".");
  const validations =
    getValueByStringPath(validationsByFieldType[props.fieldType], fieldPath) ||
    [];

  validations.forEach((validator) => validator(value, validationErrors));
  setValueByStringPath(errors.value, fieldPath, validationErrors);
};

const validateAll = (value = props.value) => {
  if (props.fieldType !== "address") {
    validateField({ value: value?.value, field: "value" });
  }
};

const resetValidation = () => {
  errors.value = getFreshValidationErrors();
};

const attemptSave = () => {
  validateAll();

  if (!hasErrors(errors.value)) {
    emit("save");
  }
};
</script>

<template>
  <Component
    v-bind="$attrs"
    :is="formByFieldType[fieldType]"
    :title="title"
    :value="value"
    :errors="errors"
    :form-type="formType"
    :field-type="fieldType"
    :existing-addresses="existingAddresses"
    @input="
      ($event) => {
        emit('input', $event);
      }
    "
    @validate="validateField"
    @validate-all="validateAll"
    @reset-validation="resetValidation"
    @attempt-save="attemptSave"
  />
</template>
