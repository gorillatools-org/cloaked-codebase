<script setup>
import { computed, ref } from "vue";
import FormContainer from "./FormContainer.vue";
import { StateList } from "@/scripts/countries/states";
import inlineSvg from "@/features/InlineSvg";
import InputValidationError from "@/features/InputValidationError.vue";

const props = defineProps({
  form: { type: Object, default: null },
});

const formData = computed(() => {
  return props.form;
});

// Error states for all address fields
const streetError = ref(null);
const postcodeError = ref(null);
const cityError = ref(null);
const stateError = ref(null);

// Individual field validation functions
function validateStreet() {
  const street = formData.value.address.street;
  if (!street || street.length === 0) {
    streetError.value = "This field is required";
  } else {
    streetError.value = null;
  }
}

function validatePostcode() {
  const postcode = formData.value.address.postcode;
  if (!postcode || postcode.length === 0) {
    postcodeError.value = "This field is required";
  } else {
    postcodeError.value = null;
  }
}

function validateCity() {
  const city = formData.value.address.city;
  if (!city || city.length === 0) {
    cityError.value = "This field is required";
  } else {
    cityError.value = null;
  }
}

function validateState() {
  const state = formData.value.address.state_province;
  if (!state || state.length === 0) {
    stateError.value = "This field is required";
  } else {
    stateError.value = null;
  }
}

// Validate all fields (called when continue is clicked)
function validateAllFields() {
  validateStreet();
  validatePostcode();
  validateCity();
  validateState();
}

// Expose validation function to parent
defineExpose({
  validateAllFields,
});

// Field-specific blur handlers
function onStreetBlur() {
  validateStreet();
}

function onPostcodeBlur() {
  validatePostcode();
}

function onCityBlur() {
  validateCity();
}

function onStateBlur() {
  validateState();
}

// Real-time validation when error is already shown
function onStreetInput() {
  if (streetError.value) {
    validateStreet();
  }
}

function onPostcodeInput() {
  if (postcodeError.value) {
    validatePostcode();
  }
}

function onCityInput() {
  if (cityError.value) {
    validateCity();
  }
}

function onStateChange() {
  if (stateError.value) {
    validateState();
  }
}
</script>

<template>
  <FormContainer icon="pay/address">
    <div
      class="input-wrapper"
      :class="{ 'input-wrapper--error': streetError }"
    >
      <label>Street address</label>
      <div
        class="input"
        :class="{ 'input--error': streetError }"
      >
        <input
          v-model="formData.address.street"
          type="text"
          @input="onStreetInput"
          @blur="onStreetBlur"
        />
      </div>
      <transition name="error-fade">
        <InputValidationError v-if="streetError">
          {{ streetError }}
        </InputValidationError>
      </transition>
    </div>

    <div
      class="input-wrapper"
      :class="{ 'input-wrapper--error': postcodeError }"
    >
      <label>Zip</label>
      <div
        class="input"
        :class="{ 'input--error': postcodeError }"
      >
        <input
          v-model="formData.address.postcode"
          type="text"
          @input="onPostcodeInput"
          @blur="onPostcodeBlur"
        />
      </div>
      <transition name="error-fade">
        <InputValidationError v-if="postcodeError">
          {{ postcodeError }}
        </InputValidationError>
      </transition>
    </div>

    <div
      class="input-wrapper"
      :class="{ 'input-wrapper--error': cityError }"
    >
      <label>City</label>
      <div
        class="input"
        :class="{ 'input--error': cityError }"
      >
        <input
          v-model="formData.address.city"
          type="text"
          @input="onCityInput"
          @blur="onCityBlur"
        />
      </div>
      <transition name="error-fade">
        <InputValidationError v-if="cityError">
          {{ cityError }}
        </InputValidationError>
      </transition>
    </div>

    <div
      class="input-wrapper"
      :class="{ 'input-wrapper--error': stateError }"
    >
      <label>State</label>
      <div
        class="input select"
        :class="{ 'input--error': stateError }"
      >
        <select
          v-model="formData.address.state_province"
          @change="onStateChange"
          @blur="onStateBlur"
        >
          <option value="">Select state</option>
          <option
            v-for="state in StateList"
            :key="state.value"
            :value="state.value"
          >
            {{ state.label }}
          </option>
        </select>

        <inlineSvg name="chevron-down" />
      </div>
      <transition name="error-fade">
        <InputValidationError v-if="stateError">
          {{ stateError }}
        </InputValidationError>
      </transition>
    </div>
  </FormContainer>
</template>

<style lang="scss" scoped>
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

        input,
        select {
          width: 100%;
          border: 1px solid $color-primary-50;
          background: transparent;
          padding: 18px 24px;
          border-radius: 8px;
          color: $color-primary-100;
          font-size: 15px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;
          transition:
            border-color 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;

          &:focus {
            border: 1px solid $color-primary-100;
            outline: none;
          }
        }

        &--error input,
        &--error select {
          border: 1px solid $color-alert !important;
          box-shadow: 0 0 0 1px rgba($color-alert, 0.1);
        }

        select {
          height: 61px;
          appearance: none;
          appearance: none;
          appearance: none;
          text-indent: 1px;
          text-overflow: "";
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

        &.select {
          select {
            padding-right: 58px;
            position: relative;
            font-family: inherit;
            text-overflow: ellipsis;
            cursor: pointer;
          }

          svg {
            position: absolute;
            top: 50%;
            right: 18px;
            transform: translateY(-50%);
            pointer-events: none;
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
