<script setup>
import { ref } from "vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import EnrollmentCard from "@/features/enrollment/EnrollmentCard.vue";
import EnrollmentCardHeader from "@/features/enrollment/EnrollmentCardHeader.vue";
import EnrollmentTags from "@/features/enrollment/EnrollmentTags.vue";
import EnrollmentTag from "@/features/enrollment/EnrollmentTag.vue";
import EnrollmentBackground from "@/features/enrollment/EnrollmentBackground.vue";
import { formatPhoneStringBasic } from "@/scripts/format.js";
import { useEmailValidation } from "@/composables/validation/useEmailValidation.js";
import { usePhoneValidation } from "@/composables/validation/usePhoneValidation.js";
import { useFormattedPhones } from "@/features/enrollment/composables.js";

defineEmits(["next"]);

const phoneNumbers = defineModel("phoneNumbers", { type: Array });
const emailAddresses = defineModel("emailAddresses", { type: Array });

const formattedPhoneNumbers = useFormattedPhones(phoneNumbers);

const onAddPhone = () => {
  validatePhone();

  if (phoneError.value || !phone.value) {
    return;
  }

  const formattedPhone = formatPhoneStringBasic(phone.value);
  phoneNumbers.value.push(formattedPhone);
  phone.value = "";
};

const onRemovePhone = (phone) => {
  phoneNumbers.value = phoneNumbers.value.filter((item) => item !== phone);
};

const onAddEmail = () => {
  validateEmail();

  if (emailError.value || !email.value) {
    return;
  }

  emailAddresses.value.push(email.value);
  email.value = "";
};

const onRemoveEmail = (email) => {
  emailAddresses.value = emailAddresses.value.filter((item) => item !== email);
};

const phone = ref("");
const email = ref("");

const {
  error: phoneError,
  validate: validatePhone,
  validateDebounced: validatePhoneDebounced,
} = usePhoneValidation(phone, { isRequired: false });

const {
  error: emailError,
  validate: validateEmail,
  validateDebounced: validateEmailDebounced,
} = useEmailValidation(email, { isRequired: false });

const validatePhones = () => {
  if (phone.value) {
    validatePhone();
  }

  if (!phoneError.value) {
    onAddPhone();
  }

  if (!phoneError.value && phoneNumbers.value.length === 0) {
    phoneError.value = "At least one phone number required";
  }
};

const validateEmails = () => {
  if (email.value) {
    validateEmail();
  }

  if (!emailError.value) {
    onAddEmail();
  }

  if (!emailError.value && emailAddresses.value.length === 0) {
    emailError.value = "At least one email address required";
  }
};

const validateForm = () => {
  validatePhones();
  validateEmails();

  return !phoneError.value && !emailError.value;
};

defineExpose({ validateForm });
</script>

<template>
  <div>
    <EnrollmentBackground type="removal" />
    <EnrollmentCard>
      <EnrollmentCardHeader />
      <BaseText
        as="h2"
        variant="headline-5-bold"
      >
        Basic Information
      </BaseText>
      <BaseInput
        v-model="phone"
        :error="phoneError"
        title="Phone Numbers*"
        placeholder="(212) 555-0101"
        autocomplete="tel"
        inputmode="tel"
        action="plus"
        @blur="validatePhone"
        @input="validatePhoneDebounced"
        @click-action="onAddPhone"
        @keydown.enter="onAddPhone"
      />
      <EnrollmentTags>
        <EnrollmentTag
          v-for="phoneNumber in formattedPhoneNumbers"
          :key="phoneNumber.phone"
          tabindex="0"
          @keydown.delete="onRemovePhone(phoneNumber.phone)"
          @click="onRemovePhone(phoneNumber.phone)"
        >
          {{ phoneNumber.display }}
        </EnrollmentTag>
      </EnrollmentTags>
      <BaseInput
        v-model="email"
        :error="emailError"
        title="Email Addresses*"
        placeholder="john@appleseed.com"
        autocomplete="email"
        inputmode="email"
        action="plus"
        @blur="validateEmail"
        @input="validateEmailDebounced"
        @click-action="onAddEmail"
        @keydown.enter="onAddEmail"
      />
      <EnrollmentTags>
        <EnrollmentTag
          v-for="emailAddress in emailAddresses"
          :key="emailAddress"
          tabindex="0"
          @click="onRemoveEmail(emailAddress)"
          @keydown.delete="onRemoveEmail(emailAddress)"
        >
          {{ emailAddress }}
        </EnrollmentTag>
      </EnrollmentTags>
    </EnrollmentCard>
    <BaseButton
      icon="arrow-right"
      size="md"
      full-width
      class="page-enrollment-contacts__next"
      @click="$emit('next')"
      @keydown.enter="$emit('next')"
    >
      Continue
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.page-enrollment-contacts {
  &__next {
    margin-top: 16px;

    &:focus {
      outline: 1px solid $color-primary-100;
    }
  }
}
</style>
