<script setup>
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import EnrollmentCard from "@/features/enrollment/EnrollmentCard.vue";
import EnrollmentCardHeader from "@/features/enrollment/EnrollmentCardHeader.vue";
import EnrollmentBackground from "@/features/enrollment/EnrollmentBackground.vue";
import { useNameValidation } from "@/composables/validation/useNameValidation.js";
import { useDateOfBirthValidation } from "@/composables/validation/useDateOfBirthValidation.js";
import { getFormattedDateOfBirthValue } from "@/features/enrollment/utils.js";

defineEmits(["next"]);

const firstName = defineModel("firstName", { type: String });
const middleName = defineModel("middleName", { type: String });
const lastName = defineModel("lastName", { type: String });

const dateOfBirth = defineModel("dateOfBirth", {
  type: String,
  get: getFormattedDateOfBirthValue,
});

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
  error: dateOfBirthError,
  validate: validateDateOfBirth,
  validateDebounced: validateDateOfBirthDebounced,
} = useDateOfBirthValidation(dateOfBirth);

const validateForm = () => {
  validateFirstName();
  validateMiddleName();
  validateLastName();
  validateDateOfBirth();

  return (
    !firstNameError.value &&
    !middleNameError.value &&
    !lastNameError.value &&
    !dateOfBirthError.value
  );
};

defineExpose({ validateForm });
</script>

<template>
  <div class="page-enrollment-names">
    <EnrollmentBackground
      type="removal"
      animated
    />
    <EnrollmentCard class="page-enrollment-names__card">
      <EnrollmentCardHeader class="page-enrollment-names__header" />
      <BaseText
        as="h2"
        variant="headline-5-bold"
        class="page-enrollment-names__title"
      >
        Basic Information
      </BaseText>
      <BaseInput
        v-model="firstName"
        :error="firstNameError"
        title="First Name*"
        placeholder="John"
        autocomplete="given-name"
        class="page-enrollment-names__first-name"
        @blur="validateFirstName"
        @input="validateFirstNameDebounced"
        @keydown.enter="$emit('next')"
      />
      <BaseInput
        v-model="middleName"
        :error="middleNameError"
        title="Middle Name"
        placeholder="William"
        autocomplete="additional-name"
        class="page-enrollment-names__middle-name"
        @blur="validateMiddleName"
        @input="validateMiddleNameDebounced"
        @keydown.enter="$emit('next')"
      />
      <BaseInput
        v-model="lastName"
        :error="lastNameError"
        title="Last Name*"
        placeholder="Appleseed"
        autocomplete="family-name"
        class="page-enrollment-names__last-name"
        @blur="validateLastName"
        @input="validateLastNameDebounced"
        @keydown.enter="$emit('next')"
      />
      <BaseInput
        v-model="dateOfBirth"
        :error="dateOfBirthError"
        title="Date of Birth (MM-DD-YYYY)*"
        placeholder="02-22-1990"
        autocomplete="bday"
        inputmode="numeric"
        maxlength="10"
        class="page-enrollment-names__dob"
        @blur="validateDateOfBirth"
        @input="validateDateOfBirthDebounced"
        @keydown.enter="$emit('next')"
      />
    </EnrollmentCard>
    <BaseButton
      icon="arrow-right"
      size="md"
      full-width
      class="page-enrollment-names__next"
      @click="$emit('next')"
      @keydown.enter="$emit('next')"
    >
      Continue
    </BaseButton>
  </div>
</template>

<style scoped lang="scss">
.page-enrollment-names {
  &__card {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "header header" "title title" "first-name middle-name" "last-name last-name" "dob dob";
    align-items: start;
  }

  &__header {
    grid-area: header;
  }

  &__title {
    grid-area: title;
  }

  &__first-name {
    grid-area: first-name;
  }

  &__middle-name {
    grid-area: middle-name;
  }

  &__last-name {
    grid-area: last-name;
  }

  &__dob {
    grid-area: dob;
  }

  &__next {
    margin-top: 16px;

    &:focus {
      outline: 1px solid $color-primary-100;
    }
  }
}
</style>
