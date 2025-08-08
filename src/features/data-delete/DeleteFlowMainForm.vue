<script setup>
import { computed, onMounted, ref, watch } from "vue";
import AtomGradientBoxWrapper from "@/library/AtomGradientBoxWrapper.vue";
import AtomMultipleInputRow from "@/library/AtomMultipleInputRow.vue";
import AtomInput from "@/library/AtomInput.vue";
import DeleteFlowAddressInput from "@/features/data-delete/atoms/DeleteFlowAddressInput.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { usePhoneValidation } from "@/composables/validation/usePhoneValidation.js";
import { useEmailValidation } from "@/composables/validation/useEmailValidation.js";
import { useNameValidation } from "@/composables/validation/useNameValidation.js";
import { useBirthYearValidation } from "@/composables/validation/useBirthYearValidation.js";
import { useAddressValidation } from "@/features/data-delete/composables/useAddressValidation.js";
import { PH_EVENT_USER_VIEWED_DD_SUBMISSION_FORM } from "@/scripts/posthogEvents.js";

const emit = defineEmits(["submit"]);

onMounted(() => posthogCapture(PH_EVENT_USER_VIEWED_DD_SUBMISSION_FORM));

const nameInput = ref(null);
const birthYearInput = ref(null);
const addressInput = ref(null);
const emailInput = ref(null);
const phoneInput = ref(null);

const scrollToField = (field) => {
  const fieldToElement = {
    name: nameInput,
    birth_year: birthYearInput,
    addresses: addressInput,
    email_addresses: emailInput,
    phone_numbers: phoneInput,
  };

  const element = fieldToElement[field]?.value?.$el;

  element?.scrollIntoView({ behavior: "smooth" });
  element?.focus();
};

const firstName = defineModel("firstName", { type: String });
const middleName = defineModel("middleName", { type: String });
const lastName = defineModel("lastName", { type: String });
const birthYear = defineModel("birthYear", { type: String });
const address = defineModel("address", { type: Object });
const phone = defineModel("phone", { type: String });
const email = defineModel("email", { type: String });

const {
  error: firstNameError,
  validate: validateFirstName,
  validateDebounced: validateFirstNameDebounced,
} = useNameValidation(firstName);

const {
  error: middleNameError,
  validate: validateMiddleName,
  validateDebounced: validateMiddleNameDebounced,
} = useNameValidation(middleName, { isRequired: false });

const {
  error: lastNameError,
  validate: validateLastName,
  validateDebounced: validateLastNameDebounced,
} = useNameValidation(lastName);

const {
  error: birthYearError,
  validate: validateBirthYear,
  validateDebounced: validateBirthYearDebounced,
} = useBirthYearValidation(birthYear);

const {
  error: phoneError,
  validate: validatePhone,
  validateDebounced: validatePhoneDebounced,
} = usePhoneValidation(phone);

const {
  error: emailError,
  validate: validateEmail,
  validateDebounced: validateEmailDebounced,
} = useEmailValidation(email);

const { error: addressError, validate: validateAddress } =
  useAddressValidation(address);

const isFormValid = computed(
  () =>
    !(
      firstNameError.value ||
      middleNameError.value ||
      lastNameError.value ||
      birthYearError.value ||
      phoneError.value ||
      emailError.value ||
      addressError.value
    )
);

const validateForm = () => {
  validateFirstName();
  validateMiddleName();
  validateLastName();
  validateBirthYear();
  validatePhone();
  validateEmail();
  validateAddress();
};

watch(address, (newValue) => newValue && validateAddress());

const onSubmit = () => {
  validateForm();

  if (isFormValid.value) {
    emit("submit");
  }
};

defineExpose({ onSubmit, scrollToField });
</script>
<template>
  <div class="delete-flow-main-form-wrapper">
    <AtomGradientBoxWrapper class="form-box-wrapper">
      <AtomMultipleInputRow>
        <AtomInput
          ref="nameInput"
          class="form-input capitalize"
          label="First Name*"
          placeholder="First"
          type="text"
          :error="!!firstNameError"
          :errorMessage="firstNameError"
          :value="firstName"
          @input="
            firstName = $event.target.value;
            validateFirstNameDebounced();
          "
          @blur="validateFirstName"
        />
        <AtomInput
          class="form-input capitalize"
          label="Middle Name"
          placeholder="Middle"
          type="text"
          :error="!!middleNameError"
          :errorMessage="middleNameError"
          :value="middleName"
          @input="
            middleName = $event.target.value;
            validateMiddleNameDebounced();
          "
          @blur="validateMiddleName"
        />
      </AtomMultipleInputRow>
      <AtomInput
        ref="nameInput"
        class="form-input capitalize"
        label="Last Name*"
        placeholder="Last"
        type="text"
        :error="!!lastNameError"
        :errorMessage="lastNameError"
        :value="lastName"
        @input="
          lastName = $event.target.value;
          validateLastNameDebounced();
        "
        @blur="validateLastName"
      />
      <AtomInput
        ref="birthYearInput"
        class="form-input"
        label="Birth Year*"
        placeholder="YYYY"
        type="text"
        :value="birthYear"
        :error="!!birthYearError"
        :errorMessage="birthYearError"
        maxlength="4"
        inputmode="numeric"
        @input="
          birthYear = $event.target.value;
          validateBirthYearDebounced();
        "
        @blur="validateBirthYear"
      />
      <DeleteFlowAddressInput
        ref="addressInput"
        v-model="address"
        :error="addressError"
        label="Current Address*"
        placeholder="123 Main St"
      />
      <AtomInput
        ref="phoneInput"
        class="form-input"
        label="Phone Number*"
        placeholder="(212) 555-0101"
        type="phone"
        :error="!!phoneError"
        :errorMessage="phoneError"
        :value="phone"
        @input="
          phone = $event.target.value;
          validatePhoneDebounced();
        "
        @blur="validatePhone"
      />
      <AtomInput
        ref="emailInput"
        class="form-input"
        label="Email Address*"
        placeholder="email@domain.com"
        type="email"
        :error="!!emailError"
        :errorMessage="emailError"
        :value="email"
        @input="
          email = $event.target.value;
          validateEmailDebounced();
        "
        @keydown.enter="onSubmit"
        @blur="validateEmail"
      />
    </AtomGradientBoxWrapper>
  </div>
</template>
<style scoped lang="scss">
.delete-flow-main-form-wrapper {
  @keyframes fade-in {
    0% {
      opacity: 0.5;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes slide-up {
    0% {
      margin-top: 20px;
    }

    100% {
      margin-top: 0;
    }
  }

  animation:
    fade-in 0.5s ease-in-out forwards,
    slide-up 0.5s ease-in-out forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 0 24px;
  width: 100%;

  .subheader-bubble {
    font-size: 12px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    color: $color-primary-100;
    padding: 6px 12px;
    border-radius: 115.91px;
    border: 0.739px solid rgba($white, 0.15);

    @at-root .theme-light & {
      border: 0.739px solid rgba($black, 0.15);
    }
  }

  .form-box-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    gap: 16px;
    margin: 0 20px;
  }
}

.form-input {
  &.capitalize {
    &:deep(.atom-input-wrapper--input) {
      text-transform: capitalize;
    }
  }

  &:deep(.atom-input-wrapper--input) {
    background-color: rgba($white, 0.1) !important;
    border: 1px solid rgba($white, 0.1) !important;

    &::placeholder {
      color: $color-primary-70 !important;
    }

    @at-root .theme-light & {
      border: 1px solid rgba($black, 0.1) !important;
      background-color: rgba($black, 0.1) !important;
    }
  }

  &:deep(.atom-input-wrapper) {
    background-color: rgba($white, 0.1) !important;
    border: 1px solid rgba($white, 0.1) !important;

    .placeholder {
      color: $color-primary-70 !important;
    }

    @at-root .theme-light & {
      border: 1px solid rgba($black, 0.1) !important;
      background-color: rgba($black, 0.1) !important;
    }
  }

  &-guide {
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    color: $color-primary-100;
    opacity: 0.5;
  }

  &-button {
    height: 46px;
    width: 46px;
    margin-right: -10px;
    background-color: transparent;
    border: none;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  &-icon {
    color: $color-primary-100;
    width: 18px;
    height: 18px;
  }
}
</style>
