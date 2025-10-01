<script setup>
import { watch, ref, computed } from "vue";
import moment from "moment";
import inlineSvg from "@/features/InlineSvg.vue";
import FormContainer from "./FormContainer.vue";
import SSNModal from "./SsnModal.vue";
import InputValidationError from "@/features/InputValidationError.vue";

const props = defineProps({
  form: { type: Object, default: null },
});

const emit = defineEmits(["validateStep", "invalidateStep"]);

const formData = computed(() => {
  return props.form;
});

// Error states for all fields
const firstNameError = ref(null);
const lastNameError = ref(null);
const dobError = ref(null);
const governmentIdError = ref(null);
const emailError = ref(null);
const phoneError = ref(null);

const ssnModal = ref(false);

function toggleSSNModal() {
  ssnModal.value = !ssnModal.value;
}

function validDate(date) {
  return moment(date, "MM/DD/YYYY", true).isValid();
}

function validSSN(ssn) {
  return ssn.length === 9;
}

function validEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

const passwordVisible = ref(false);
const count = ref(0);

function togglePasswordVisible() {
  passwordVisible.value = !passwordVisible.value;
  count.value++;
}

function formatDate(event) {
  const input = event.target;
  let value = input.value.replace(/\D/g, ""); // Remove any non-digits

  // Add slashes at appropriate positions
  if (value.length >= 2) {
    value = value.slice(0, 2) + "/" + value.slice(2);
  }
  if (value.length >= 5) {
    value = value.slice(0, 5) + "/" + value.slice(5);
  }

  // Limit to MM/DD/YYYY format (10 characters max)
  if (value.length > 10) {
    value = value.slice(0, 10);
  }

  formData.value.dob = value;

  // Set cursor position after formatting
  const cursorPos = value.length;
  input.setSelectionRange(cursorPos, cursorPos);
}

function handleDateBackspace(event) {
  const input = event.target;
  const cursorPosition = input.selectionStart;
  const currentValue = input.value;

  // Only handle backspace key
  if (event.key !== "Backspace") return;

  // Check if we're about to delete a slash
  if (cursorPosition > 0 && currentValue[cursorPosition - 1] === "/") {
    event.preventDefault();

    // Delete the slash and the character before it
    const newValue =
      currentValue.slice(0, cursorPosition - 2) +
      currentValue.slice(cursorPosition);
    formData.value.dob = newValue;

    // Set cursor position after deletion
    setTimeout(() => {
      input.setSelectionRange(cursorPosition - 2, cursorPosition - 2);
    }, 0);
  }
  // Otherwise allow normal backspace behavior
}

function validUSPhoneNumber(phone) {
  const usPhonePattern = /^\+1\d{10}$/;
  return usPhonePattern.test(phone);
}

// Individual field validation functions
function validateFirstName() {
  const firstName = formData.value.first_name;
  if (!firstName || firstName.length === 0) {
    firstNameError.value = "This field is required";
  } else {
    firstNameError.value = null;
  }
}

function validateLastName() {
  const lastName = formData.value.last_name;
  if (!lastName || lastName.length === 0) {
    lastNameError.value = "This field is required";
  } else {
    lastNameError.value = null;
  }
}

function validateDob() {
  const dob = formData.value.dob;
  if (!dob || dob.length === 0) {
    dobError.value = "This field is required";
  } else if (!validDate(dob)) {
    dobError.value = "Please provide a valid date";
  } else {
    dobError.value = null;
  }
}

function validateGovernmentId() {
  const governmentId = formData.value.government_id;
  if (!governmentId || governmentId.length === 0) {
    governmentIdError.value = "This field is required";
  } else if (!validSSN(governmentId)) {
    governmentIdError.value = "Please provide a valid SSN or ITIN";
  } else {
    governmentIdError.value = null;
  }
}

// Validate email
function validateEmail() {
  const email = formData.value.email;
  if (!email || email.length === 0) {
    emailError.value = "This field is required";
  } else if (!validEmail(email)) {
    emailError.value = "Please provide a valid email address";
  } else {
    emailError.value = null;
  }
}

// Validate phone
function validatePhone() {
  const phone = formData.value.phone_number;
  if (!phone || phone.length === 0) {
    phoneError.value = "This field is required";
  } else if (!validUSPhoneNumber(phone)) {
    phoneError.value = "Please provide a valid phone number";
  } else {
    phoneError.value = null;
  }
}

// Validate all fields (called when continue is clicked)
function validateAllFields() {
  validateFirstName();
  validateLastName();
  validateDob();
  validateGovernmentId();
  validateEmail();
  validatePhone();
}

// Expose validation function to parent
defineExpose({
  validateAllFields,
});

// Validation on blur only
function onEmailBlur() {
  validateEmail();
}

function onPhoneBlur() {
  validatePhone();
}

// Field-specific blur handlers
function onFirstNameBlur() {
  validateFirstName();
}

function onLastNameBlur() {
  validateLastName();
}

function onDobBlur() {
  validateDob();
}

function onGovernmentIdBlur() {
  validateGovernmentId();
}

// Real-time validation when error is already shown
function onFirstNameInput() {
  if (firstNameError.value) {
    validateFirstName();
  }
}

function onLastNameInput() {
  if (lastNameError.value) {
    validateLastName();
  }
}

function onDobInput(event) {
  formatDate(event);
  if (dobError.value) {
    validateDob();
  }
}

function onGovernmentIdInput() {
  if (governmentIdError.value) {
    validateGovernmentId();
  }
}

function onEmailInput() {
  // Only validate in real-time if there's already an error showing
  if (emailError.value) {
    validateEmail();
  }
}

function onPhoneInput() {
  // Only validate in real-time if there's already an error showing
  if (phoneError.value) {
    validatePhone();
  }
}

watch(
  props.form,
  (value) => {
    if (
      value.first_name.length > 0 &&
      value.last_name.length > 0 &&
      validDate(value.dob) &&
      validSSN(value.government_id) &&
      value.email.length > 0 &&
      validEmail(value.email) &&
      value.phone_number.length > 0 &&
      validUSPhoneNumber(value.phone_number)
    ) {
      emit("validateStep");
    } else {
      emit("invalidateStep");
    }
  },
  { deep: true }
);

function onlyNumbers(event) {
  const key = event.key;
  if (key === "Backspace") {
    return;
  }
  if (isNaN(key)) {
    event.preventDefault();
  }
}
</script>

<template>
  <div>
    <FormContainer icon="pay/basic-information">
      <div
        class="input-wrapper"
        :class="{ 'input-wrapper--error': firstNameError }"
      >
        <label>Legal first name</label>
        <div
          class="input"
          :class="{ 'input--error': firstNameError }"
        >
          <input
            v-model="formData.first_name"
            type="text"
            @input="onFirstNameInput"
            @blur="onFirstNameBlur"
          />
        </div>
        <transition name="error-fade">
          <InputValidationError v-if="firstNameError">
            {{ firstNameError }}
          </InputValidationError>
        </transition>
      </div>

      <div
        class="input-wrapper"
        :class="{ 'input-wrapper--error': lastNameError }"
      >
        <label>Legal last name</label>
        <div
          class="input"
          :class="{ 'input--error': lastNameError }"
        >
          <input
            v-model="formData.last_name"
            type="text"
            @input="onLastNameInput"
            @blur="onLastNameBlur"
          />
        </div>
        <transition name="error-fade">
          <InputValidationError v-if="lastNameError">
            {{ lastNameError }}
          </InputValidationError>
        </transition>
      </div>

      <div
        class="input-wrapper"
        :class="{ 'input-wrapper--error': dobError }"
      >
        <label>Date of birth</label>
        <div
          class="input"
          :class="{ 'input--error': dobError }"
        >
          <input
            v-model="formData.dob"
            type="text"
            maxlength="10"
            placeholder="MM/DD/YYYY"
            @input="onDobInput"
            @blur="onDobBlur"
            @keydown="handleDateBackspace"
            @keypress="onlyNumbers"
          />
        </div>
        <transition name="error-fade">
          <InputValidationError v-if="dobError">
            {{ dobError }}
          </InputValidationError>
        </transition>
      </div>

      <div
        class="input-wrapper"
        :class="{ 'input-wrapper--error': governmentIdError }"
      >
        <label>SSN or ITIN</label>
        <div
          class="input toggle"
          :class="{ 'input--error': governmentIdError }"
        >
          <input
            v-model="formData.government_id"
            :type="passwordVisible ? 'text' : 'password'"
            maxlength="9"
            @keypress="onlyNumbers"
            @input="onGovernmentIdInput"
            @blur="onGovernmentIdBlur"
          />
          <div
            class="toggle"
            @click="togglePasswordVisible()"
          >
            <inlineSvg
              :key="count"
              :name="passwordVisible ? 'eye-slash' : 'eye'"
            />
          </div>
        </div>
        <div class="feedback-container">
          <transition name="error-fade">
            <InputValidationError v-if="governmentIdError">
              {{ governmentIdError }}
            </InputValidationError>
          </transition>
          <span @click="toggleSSNModal()">
            Why do we need this
            <inlineSvg name="lock-shield" />
          </span>
        </div>
      </div>

      <div
        class="input-wrapper"
        :class="{ 'input-wrapper--error': phoneError }"
      >
        <label>Personal phone</label>
        <div
          class="input"
          :class="{ 'input--error': phoneError }"
        >
          <input
            v-model="formData.phone_number"
            type="tel"
            placeholder="+11234567890"
            @input="onPhoneInput"
            @blur="onPhoneBlur"
          />
        </div>
        <transition name="error-fade">
          <InputValidationError v-if="phoneError">
            {{ phoneError }}
          </InputValidationError>
        </transition>
      </div>

      <div
        class="input-wrapper"
        :class="{ 'input-wrapper--error': emailError }"
      >
        <label>Personal email</label>
        <div
          class="input"
          :class="{ 'input--error': emailError }"
        >
          <input
            v-model="formData.email"
            type="email"
            @input="onEmailInput"
            @blur="onEmailBlur"
          />
        </div>
        <transition name="error-fade">
          <InputValidationError v-if="emailError">
            {{ emailError }}
          </InputValidationError>
        </transition>
      </div>
    </FormContainer>

    <SSNModal
      :show="ssnModal"
      @close="toggleSSNModal()"
    />
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.form {
  margin-top: 48px;
  margin-bottom: 32px;

  .icon {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 68px;
    color: $color-primary-100;

    svg {
      width: 73px;
      height: auto;
    }
  }

  .inputs {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .input-wrapper {
      width: calc(50% - 5px);
      margin-top: 24px;
      transition: all 0.3s ease-in-out;

      &:nth-of-type(-n + 2) {
        margin-top: 0;
      }

      &.full-width {
        width: 100%;
      }

      label {
        display: block;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        color: $color-primary-100;
        margin-bottom: 4px;
      }

      .input {
        position: relative;

        input {
          width: 100%;
          border: 1px solid $color-primary-50;
          background: transparent;
          padding: 18px 24px;
          border-radius: 8px;
          color: $color-primary-100;
          transition:
            border-color 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;

          &:focus {
            border: 1px solid $color-primary-100;
            outline: none;
          }
        }

        &--error input {
          border: 1px solid $color-alert !important;
          box-shadow: 0 0 0 1px rgba($color-alert, 0.1);
        }

        &.toggle {
          input {
            padding-right: 58px;
          }

          .toggle {
            position: absolute;
            top: 50%;
            right: 18px;
            transform: translateY(-50%);
            cursor: pointer;
            color: $color-primary-100;
            width: 24px;
            height: 24px;
          }
        }
      }

      span {
        display: flex;
        align-items: center;
        color: $color-primary-100;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        margin-top: 5px;
        cursor: pointer;

        svg {
          width: 14px;
          height: 14px;
          margin-left: 4px;
          display: inline-block;
        }
      }

      .feedback-container {
        transition: all 0.3s ease-in-out;
      }
    }
  }
}

// Error animation with height transition for smooth sliding
.error-fade-enter-active {
  transition: all 0.3s ease-in-out;
}

.error-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.error-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  margin-top: 0;
}

.error-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
  margin-top: 4px;
}

.error-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
  margin-top: 4px;
}

.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  margin-top: 0;
}
</style>
