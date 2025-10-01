<script setup>
import { ref } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import EnrollmentTag from "@/features/enrollment/EnrollmentTag.vue";
import EnrollmentTags from "@/features/enrollment/EnrollmentTags.vue";
import EnrollmentAddressInput from "@/features/enrollment/EnrollmentAddressInput.vue";
import EnrollmentAddInfo from "@/features/enrollment/EnrollmentAddInfo.vue";
import { useDateOfBirthValidation } from "@/composables/validation/useDateOfBirthValidation.js";
import { usePhoneValidation } from "@/composables/validation/usePhoneValidation.js";
import { useEmailValidation } from "@/composables/validation/useEmailValidation.js";
import {
  useFormattedAddresses,
  useFormattedPhones,
} from "@/features/enrollment/composables.js";
import { formatPhoneStringBasic } from "@/scripts/format.js";
import { getFormattedDateOfBirthValue } from "@/features/enrollment/utils.js";
import { useToast } from "@/composables/useToast.js";
import { MAX_ADDRESSES_LIMIT } from "@/scripts/constants";

defineProps({
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["add-names", "add-addresses"]);

const names = defineModel("names", { type: Array });
const dateOfBirth = defineModel("dateOfBirth", {
  type: String,
  get: getFormattedDateOfBirthValue,
});
const phoneNumbers = defineModel("phoneNumbers", { type: Array });
const emailAddresses = defineModel("emailAddresses", { type: Array });
const addresses = defineModel("addresses", { type: Array });

const formattedPhoneNumbers = useFormattedPhones(phoneNumbers);
const formattedAddresses = useFormattedAddresses(addresses);

const phone = ref("");
const email = ref("");
const address = ref("");
const addressError = ref("");
const namesError = ref("");
const toast = useToast();

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

const onAddAddress = (address) => {
  // Check if we're at the limit of 25 addresses
  if (addresses.value.length >= MAX_ADDRESSES_LIMIT) {
    toast.error(
      `You can only add up to ${MAX_ADDRESSES_LIMIT} addresses. Please remove an existing address before adding a new one.`
    );
    return;
  }

  addresses.value.push(address);
};

const onRemoveAddress = (address) => {
  addresses.value = addresses.value.filter((item) => item !== address);
};

const {
  error: dateOfBirthError,
  validate: validateDateOfBirth,
  validateDebounced: validateDateOfBirthDebounced,
} = useDateOfBirthValidation(dateOfBirth);

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

const validateAddresses = () => {
  if (addresses.value.length === 0) {
    addressError.value = address.value
      ? "Please select an address from the list"
      : "At least one address required";
  }

  return !addressError.value;
};

const validateNames = () => {
  if (names.value.length === 0) {
    namesError.value = "At least one name required";
  }

  return null;
};

const validateForm = () => {
  validateDateOfBirth();
  validatePhones();
  validateEmails();
  validateAddresses();
  validateNames();

  return (
    !namesError.value &&
    !dateOfBirthError.value &&
    !phoneError.value &&
    !emailError.value &&
    !addressError.value
  );
};

defineExpose({ validateForm });

const onRemoveName = (name) => {
  names.value = names.value.filter(
    (existingName) =>
      existingName.first !== name.first ||
      existingName.last !== name.last ||
      existingName.middle !== name.middle ||
      existingName.prefix !== name.prefix ||
      existingName.suffix !== name.suffix
  );
};
</script>

<template>
  <section class="monitoring-settings-basic">
    <BaseText
      as="h4"
      variant="body-small-medium"
    >
      Basic Information
    </BaseText>
    <BaseSheet
      spacing-x="sm"
      spacing-y="lg"
      elevation="md"
      class="monitoring-settings-basic__sheet"
    >
      <EnrollmentAddInfo
        title="Names"
        subtitle="Add Name(s)"
        :error="namesError"
        :disabled="isSubmitting"
        @click="$emit('add-names')"
        @keydown.enter="$emit('add-names')"
      />
      <EnrollmentTags>
        <EnrollmentTag
          v-for="(name, index) in names"
          :key="index"
          tabindex="0"
          :disabled="isSubmitting"
          @keydown.delete="onRemoveName(name)"
          @click="onRemoveName(name)"
        >
          {{
            [name.prefix, name.first, name.middle, name.last, name.suffix]
              .filter(Boolean)
              .join(" ")
          }}
        </EnrollmentTag>
      </EnrollmentTags>
      <BaseInput
        v-model="dateOfBirth"
        :error="dateOfBirthError"
        :disabled="isSubmitting"
        title="Date of Birth (MM-DD-YYYY)*"
        placeholder="02-22-1990"
        autocomplete="bday"
        inputmode="numeric"
        maxlength="10"
        class="monitoring-settings-basic__dob"
        @blur="validateDateOfBirth"
        @input="validateDateOfBirthDebounced"
      />
      <div class="monitoring-settings-basic__phones">
        <BaseInput
          v-model="phone"
          :error="phoneError"
          :disabled="isSubmitting"
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
            :disabled="isSubmitting"
            @keydown.delete="onRemovePhone(phoneNumber.phone)"
            @click="onRemovePhone(phoneNumber.phone)"
          >
            {{ phoneNumber.display }}
          </EnrollmentTag>
        </EnrollmentTags>
      </div>
      <div class="monitoring-settings-basic__emails">
        <BaseInput
          v-model="email"
          :disabled="isSubmitting"
          title="Email Addresses*"
          placeholder="john@appleseed.com"
          autocomplete="email"
          inputmode="email"
          action="plus"
          :error="emailError"
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
            :disabled="isSubmitting"
            @click="onRemoveEmail(emailAddress)"
            @keydown.delete="onRemoveEmail(emailAddress)"
          >
            {{ emailAddress }}
          </EnrollmentTag>
        </EnrollmentTags>
      </div>
      <div class="monitoring-settings-basic__addresses">
        <EnrollmentAddressInput
          v-model="address"
          :disabled="isSubmitting"
          :error="addressError"
          title="Addresses*"
          placeholder="123 Main St Boston"
          autocomplete="street-address"
          @input="addressError = null"
          @blur="addressError = null"
          @click-action="onAddAddress"
        />
        <EnrollmentTags>
          <EnrollmentTag
            v-for="existingAddress in formattedAddresses"
            :key="existingAddress"
            tabindex="0"
            :disabled="isSubmitting"
            @click="onRemoveAddress(existingAddress.address)"
            @keydown.delete="onRemoveAddress(existingAddress.address)"
          >
            {{ existingAddress.display }}
          </EnrollmentTag>
        </EnrollmentTags>
        <EnrollmentAddInfo
          subtitle="Enter address manually"
          icon="location"
          :disabled="isSubmitting"
          @click="$emit('add-addresses')"
          @keydown.enter="$emit('add-addresses')"
        />
      </div>
    </BaseSheet>
  </section>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.monitoring-settings-basic {
  &__sheet {
    display: grid;
    row-gap: 16px;
    column-gap: 6px;
    margin-top: 8px;
    align-items: start;
  }

  &__phones {
    display: grid;
    row-gap: 16px;
  }

  &__emails {
    display: grid;
    row-gap: 16px;
  }

  &__addresses {
    display: grid;
    row-gap: 16px;
  }
}
</style>
