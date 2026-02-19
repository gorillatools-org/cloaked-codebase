<script setup lang="ts">
import { computed } from "vue";
import BaseInput from "@/library/BaseInput.vue";
import ChatInputAddress from "@/features/chat-onboarding/utils/ChatInputAddress.vue";
import { useDateOfBirthValidation } from "@/composables/validation/useDateOfBirthValidation.ts";
import { useEmailValidation } from "@/composables/validation/useEmailValidation.ts";
import { usePhoneValidation } from "@/composables/validation/usePhoneValidation.ts";
import { useAddressValidation } from "@/features/data-delete/composables/useAddressValidation";
import { useSsnValidation } from "@/composables/validation/useSsnValidation.ts";
import {
  getFormattedDateOfBirthValue,
  getFormattedPhoneNumberValue,
  getFormattedSsnValue,
} from "@/features/enrollment/utils";
import type { FieldType } from "@/features/chat-onboarding/types.ts";
import type { EnrollmentAddress } from "@/routes/enrollmentV2/PageExposureStatusEnrollExposures.vue";
import { usePersonalNameValidation } from "@/composables/validation/usePersonalNameValidation.ts";

type ChatOnboardingInputProps = {
  field: FieldType;
};

const props = defineProps<ChatOnboardingInputProps>();

const model = defineModel<string | EnrollmentAddress | null>({
  required: true,
  get: (value) => {
    if (props.field === "dateOfBirth") {
      return getFormattedDateOfBirthValue(value);
    }

    if (props.field === "phone") {
      return getFormattedPhoneNumberValue(value);
    }

    if (props.field === "ssn") {
      return getFormattedSsnValue(value);
    }

    return value;
  },
});

const fieldToTitle = {
  firstName: "First Name*",
  lastName: "Last Name*",
  email: "Email*",
  phone: "Phone Number*",
  address: "Address",
  dateOfBirth: "Date of Birth (MM-DD-YYYY)*",
  ssn: "Social Security Number (Optional)",
};

const fieldToPlaceholder = {
  firstName: "John",
  lastName: "Appleseed",
  email: "email@domain.com",
  phone: "(212) 555-0101",
  address: "Search and select your address",
  dateOfBirth: "02-22-1990",
  ssn: "123-45-6789",
};

const fieldToAutocomplete = {
  firstName: "given-name",
  lastName: "family-name",
  email: "email",
  phone: "tel",
  address: "street-address",
  dateOfBirth: "bday",
  ssn: "off",
};

const fieldToInputMode = {
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  phone: "tel",
  address: undefined,
  dateOfBirth: "numeric",
  ssn: "numeric",
};

const fieldToMaxlength = {
  firstName: undefined,
  lastName: undefined,
  email: undefined,
  phone: undefined,
  address: undefined,
  dateOfBirth: 10,
  ssn: 11,
};

const title = computed(() => fieldToTitle[props.field]);
const placeholder = computed(() => fieldToPlaceholder[props.field]);
const autoComplete = computed(() => fieldToAutocomplete[props.field]);
const inputMode = computed(() => fieldToInputMode[props.field]);
const maxLength = computed(() => fieldToMaxlength[props.field]);

const fieldToValidator = {
  firstName: usePersonalNameValidation,
  lastName: usePersonalNameValidation,
  email: useEmailValidation,
  phone: usePhoneValidation,
  address: useAddressValidation,
  dateOfBirth: useDateOfBirthValidation,
  ssn: useSsnValidation,
};

const fieldToRequired = {
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  address: true,
  dateOfBirth: true,
  ssn: false,
};

const {
  error: modelError,
  validate: validateModel,
  validateDebounced: validateModelDebounced,
  // @ts-ignore
} = fieldToValidator[props.field](model, {
  isRequired: fieldToRequired[props.field],
});

const validate = () => {
  validateModel();
  return !modelError.value;
};

const prevalidate = () => {
  validateModel();
  const isValid = !!model.value && !modelError.value;
  modelError.value = null;

  return isValid;
};

defineExpose({
  validate,
  prevalidate,
  field: props.field,
});
</script>

<template>
  <!-- type cast - something about using generic type with model didn't
  quite work the way I needed, but we know the type for "address"  -->
  <ChatInputAddress
    v-if="field === 'address'"
    v-model="model as EnrollmentAddress | null"
    :title="title"
    :placeholder="placeholder"
    :error="modelError"
    :autocomplete="autoComplete"
    @blur="validateModel"
    @click-action="model = $event"
  />
  <BaseInput
    v-else
    v-model="model"
    :title="title"
    :placeholder="placeholder"
    :error="modelError"
    :autocomplete="autoComplete"
    :inputmode="inputMode"
    :maxlength="maxLength"
    type="text"
    @blur="validateModel"
    @input="validateModelDebounced"
  />
</template>
