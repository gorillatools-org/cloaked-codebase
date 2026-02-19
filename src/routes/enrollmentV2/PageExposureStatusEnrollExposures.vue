<script setup lang="ts">
import { ref, computed, toValue, watch, onMounted } from "vue";
import { useNameValidation } from "@/composables/validation/useNameValidation.js";
import { useDateOfBirthValidation } from "@/composables/validation/useDateOfBirthValidation.js";
import { getFormattedDateOfBirthValue } from "@/features/enrollment/utils.js";
import { useEmailValidation } from "@/composables/validation/useEmailValidation.js";
import { useFormattedAddresses } from "@/features/enrollment/composables.js";
import BaseInput from "@/library/BaseInput.vue";
import BaseButton from "@/library/BaseButton.vue";
import EnrollmentAgreement from "@/features/enrollment/EnrollmentAgreement.vue";
import EnrollmentAddressInput from "@/features/enrollment/EnrollmentAddressInput.vue";
import EnrollmentTag from "@/features/enrollment/EnrollmentTag.vue";
import EnrollmentTags from "@/features/enrollment/EnrollmentTags.vue";
import PageEnrollmentAddressesManual from "@/routes/enrollment/PageEnrollmentAddressesManual.vue";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import {
  toApiPayload,
  captureAutofillAccuracy,
} from "@/features/enrollment/data-utils.js";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_USER_SUBMITTED_DD_SUBMISSION_FORM } from "@/scripts/posthogEvents.js";
import { useColorScheme } from "@/composables/useColorScheme";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import { usePhoneValidation } from "@/composables/validation/usePhoneValidation.js";
import { useSsnValidation } from "@/composables/validation/useSsnValidation.js";
import { getFormattedSsnValue } from "@/features/enrollment/utils.js";
import BaseIcon from "@/library/BaseIcon.vue";
import type { UserPhone } from "@/types/user";
import { useUserPhoneNumbers } from "@/features/data-delete/composables/useUserPhoneNumbers";
import { useSessionEnrollmentData } from "@/features/enrollment/useSessionEnrollmentData";

export interface EnrollmentAddress {
  address1?: string;
  address2?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface AutofillData {
  name?: {
    first?: string;
    last?: string;
  };
  dob?: string;
  email_addresses?: string[];
  addresses?: EnrollmentAddress[];
  phone_numbers?: string[];
  ssn?: string;
  wasAutofilled?: boolean;
}

interface Props {
  autofillData?: AutofillData;
}

interface EnrollmentRequest {
  name: {
    first?: string;
    last?: string;
  };
  dob?: string;
  addresses?: EnrollmentAddress[];
  email_addresses?: string[];
  phone_numbers?: string[];
  ssn?: string;
}

interface FormattedAddress {
  address: EnrollmentAddress;
  display: string;
}

// Composables
const { colorScheme } = useColorScheme();
const toast = useToast();

// Props
const props = withDefaults(defineProps<Props>(), {
  autofillData: () => ({}),
});

const emit = defineEmits(["exit-delete-flow"]);

const { phoneNumbers, fetch: fetchPhoneNumbers } = useUserPhoneNumbers();
const isFetchingPhones = ref(false);

// Lifecycle
onMounted(async () => {
  try {
    isFetchingPhones.value = true;
    await fetchPhoneNumbers();
  } catch {
    console.error("Error fetching phone numbers");
  } finally {
    isFetchingPhones.value = false;
  }
  posthogCapture("user_viewed_enrollment_form_exposures", {
    theme: colorScheme.value,
  });
});

const hasVerifiedPhone = computed(() => {
  return phoneNumbers.value.some(
    (phoneObject: UserPhone) => phoneObject.verified
  );
});

const verifiedPhone = computed(() => {
  const primaryPhone: UserPhone | undefined = phoneNumbers.value.find(
    (phone: UserPhone) => phone.primary && phone.verified
  );
  if (primaryPhone && primaryPhone?.phone_number) {
    return primaryPhone?.phone_number;
  }
  return phoneNumbers.value.find(
    (phoneObject: UserPhone) => phoneObject?.verified
  )?.phone_number;
});

// Models with proper typing
const firstName = defineModel<string>("firstName", { default: "" });
const lastName = defineModel<string>("lastName", { default: "" });
const dob = defineModel<string>("dob", {
  default: "",
  get: getFormattedDateOfBirthValue,
});
const email = defineModel<string>("email", { default: "" });
const addresses = defineModel<EnrollmentAddress[]>("addresses", {
  default: () => [],
});
const agreesWithTerms = defineModel<boolean>("agreesWithTerms", {
  default: false,
});

const phone = defineModel("phone", { type: String, default: "" });
const ssn = defineModel("ssn", {
  type: String,
  get: getFormattedSsnValue,
});

// Set default values after props are available
const hasPrefilledData = ref(false);
watch(
  () => props.autofillData,
  (newAutofillData: AutofillData | undefined) => {
    const autofillData = toValue(newAutofillData);
    if (autofillData?.wasAutofilled && !hasPrefilledData.value) {
      firstName.value = autofillData.name?.first || "";
      lastName.value = autofillData.name?.last || "";
      dob.value = autofillData.dob || "";
      email.value = autofillData.email_addresses?.[0] || "";
      // addresses.value = autofillData.addresses || []; // TODO: uncomment this when unmasking addresseses from microservice is working
      phone.value = autofillData.phone_numbers?.[0] || "";
      ssn.value = autofillData.ssn || "";
      hasPrefilledData.value = true;
    }
  },
  { immediate: true, deep: true }
);

const {
  error: firstNameError,
  validate: validateFirstName,
  validateDebounced: validateFirstNameDebounced,
} = useNameValidation(firstName);

const {
  error: lastNameError,
  validate: validateLastName,
  validateDebounced: validateLastNameDebounced,
} = useNameValidation(lastName);

const {
  error: dateOfBirthError,
  validate: validateDateOfBirth,
  validateDebounced: validateDateOfBirthDebounced,
} = useDateOfBirthValidation(dob);

const {
  error: emailError,
  validate: validateEmail,
  validateDebounced: validateEmailDebounced,
} = useEmailValidation(email);

const {
  error: phoneError,
  validate: validatePhone,
  validateDebounced: validatePhoneDebounced,
} = usePhoneValidation(phone, { isRequired: true });

const {
  error: ssnError,
  validate: validateSsn,
  validateDebounced: validateSsnDebounced,
} = useSsnValidation(ssn, { isRequired: false });

// State refs
const isSubmitting = ref<boolean>(false);
const addressError = ref<string | null>(null);
const addressString = ref<string | undefined>(undefined);

// Computed properties
const formattedPrimaryAddress = computed((): FormattedAddress | null => {
  if (addresses.value?.length > 0) {
    const formattedAddresses = useFormattedAddresses(addresses);
    return toValue(formattedAddresses)?.[0] || null;
  }
  return null;
});

// Validation functions
function validateAddresses(): boolean {
  if (addresses.value?.length === 0) {
    if (showAddressManual.value) {
      addressError.value = "Please add an address";
    } else {
      addressError.value = `Please select an address from the dropdown. If there is no match, please click the "Can't find your address?" link and add your address manually.`;
    }
  }

  return !addressError.value;
}

// Event handlers
function onRemoveAddress(): void {
  addresses.value = [];
}
const manualAddressValid = ref(false);
function onAddAddress(address: EnrollmentAddress): void {
  addresses.value = [address];
  if (showAddressManual.value) {
    manualAddressValid.value = true;
  }
  addressString.value = "";
  addressError.value = null;
}

const isFormValid = computed(() => {
  const baseFormValid =
    firstName.value?.length &&
    lastName.value?.length &&
    dob.value?.length &&
    email.value?.length &&
    addresses.value?.length > 0 &&
    !firstNameError.value &&
    !lastNameError.value &&
    !dateOfBirthError.value &&
    !emailError.value &&
    !addressError.value &&
    agreesWithTerms.value;

  // If manual address component is shown, also check its validity
  if (showAddressManual.value && manualAddressComponent.value) {
    return baseFormValid && Boolean(manualAddressComponent.value.isFormValid);
  }

  return baseFormValid;
});

// Component refs
const firstNameInput = ref<HTMLInputElement | null>(null);
const lastNameInput = ref<HTMLInputElement | null>(null);
const emailInput = ref<HTMLInputElement | null>(null);
const dobInput = ref<HTMLInputElement | null>(null);
const addressInput = ref<HTMLInputElement | null>(null);
const phoneInput = ref<HTMLInputElement | null>(null);
const ssnInput = ref<HTMLInputElement | null>(null);
const manualAddressComponent = ref<InstanceType<
  typeof PageEnrollmentAddressesManual
> | null>(null);

// UI state
const showAddressManual = ref<boolean>(false);

function toggleAddressManual(): void {
  showAddressManual.value = !showAddressManual.value;
  if (showAddressManual.value) {
    manualAddressValid.value = false;
  }
  addressError.value = null;
}

function validateForm(): boolean {
  validateFirstName();
  validateLastName();
  validateDateOfBirth();
  validateEmail();
  validateAddresses();
  if (!hasVerifiedPhone.value) {
    validatePhone();
  }
  validateSsn();

  const baseFormValid =
    !firstNameError.value &&
    !lastNameError.value &&
    !dateOfBirthError.value &&
    !emailError.value &&
    !addressError.value &&
    (!hasVerifiedPhone.value ? !phoneError.value : true) &&
    !ssnError.value;

  // If manual address component is shown, also check its validity
  if (showAddressManual.value && manualAddressComponent.value) {
    return baseFormValid && Boolean(manualAddressComponent.value.isFormValid);
  }

  return baseFormValid;
}

function handleSubmit() {
  if (!ssn.value) {
    showDoLaterConfirmation();
  } else {
    submitExposures();
  }
}

const { saveEnrollmentData } = useSessionEnrollmentData();

async function submitExposures(): Promise<void> {
  isSubmitting.value = true;
  if (validateForm()) {
    try {
      const phoneNumbersPayload: string[] =
        hasVerifiedPhone.value && verifiedPhone.value
          ? [verifiedPhone.value]
          : [phone.value];
      const rawPayload: EnrollmentRequest = {
        name: {
          first: firstName.value,
          last: lastName.value,
        },
        dob: dob.value,
        addresses: addresses.value,
        email_addresses: [email.value],
        phone_numbers: phoneNumbersPayload,
        ssn: ssn.value,
      };
      const payload = toApiPayload(rawPayload);
      await DataDeleteService.createEnrollmentData(payload);
      captureAutofillAccuracy(props.autofillData, rawPayload);
      saveEnrollmentData(rawPayload);
      posthogCapture(PH_EVENT_USER_SUBMITTED_DD_SUBMISSION_FORM, {
        theme: colorScheme.value,
      });
      store.dispatch("dataDelete/setRecentlyEnrolled", true);
      emit("exit-delete-flow");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Error creating enrollment data. Please try again."
      );
    } finally {
      isSubmitting.value = false;
    }
  } else {
    toast.error("Please correct the errors in the form before submitting.");
    isSubmitting.value = false;
  }
}

function showDoLaterConfirmation() {
  store.dispatch("openModal", {
    header: "Do you want to continue without adding real time alerts?",
    paragraphs: [
      "We monitor your SSN in real-time for usage across a variety of high-risk actions, including loan applications, employment and healthcare records, tax filings, online documents signings and payment platforms.",
      "You'll receive instant alerts in the mobile app if your information is compromised.",
    ],
    button: {
      text: "Do this later",
      onClick: () => {
        posthogCapture("user_skipped_ssn_monitoring", {
          theme: colorScheme.value,
        });
        submitExposures();
      },
    },
    cancelText: "Back",
    cancelIcon: "arrowturnup-left",
  });
}

function showWhyDoINeedThis() {
  store.dispatch("openModal", {
    header: "Why do I need this?",
    paragraphs: [
      "We monitor your SSN in real-time for usage across a variety of high-risk actions, including loan applications, employment and healthcare records, tax filings, online documents signings and payment platforms.",
      "You'll receive instant alerts in the mobile app if your information is compromised.",
    ],
    cancelText: "Close",
  });
}
</script>

<template>
  <div class="enroll-v2__form">
    <div class="enroll-v2__form_names">
      <BaseInput
        ref="firstNameInput"
        v-model="firstName"
        autofocus
        :error="firstNameError"
        title="First Name*"
        placeholder="John"
        autocomplete="given-name"
        class="page-enrollment-names__first-name"
        @blur="validateFirstName"
        @input="validateFirstNameDebounced"
        @keydown.enter="lastNameInput?.focus()"
      />
      <BaseInput
        ref="lastNameInput"
        v-model="lastName"
        :error="lastNameError"
        title="Last Name*"
        placeholder="Appleseed"
        autocomplete="family-name"
        class="page-enrollment-names__last-name"
        @blur="validateLastName"
        @input="validateLastNameDebounced"
        @keydown.enter="emailInput?.focus()"
      />
    </div>
    <BaseInput
      ref="emailInput"
      v-model="email"
      :error="emailError"
      title="Email*"
      placeholder="email@domain.com"
      autocomplete="email"
      class="page-enrollment-names__email"
      @blur="validateEmail"
      @input="validateEmailDebounced"
      @keydown.enter="dobInput?.focus()"
    />
    <BaseInput
      ref="dobInput"
      v-model="dob"
      :error="dateOfBirthError"
      title="Date of Birth (MM-DD-YYYY)*"
      placeholder="02-22-1990"
      autocomplete="bday"
      inputmode="numeric"
      :maxlength="10"
      class="page-enrollment-names__dob"
      @blur="validateDateOfBirth"
      @input="validateDateOfBirthDebounced"
      @keydown.enter="phoneInput?.focus()"
    />

    <BaseInput
      v-if="!hasVerifiedPhone"
      ref="phoneInput"
      v-model="phone"
      :error="phoneError"
      title="Phone Number"
      placeholder="(212) 555-0101"
      autocomplete="tel"
      inputmode="tel"
      @blur="validatePhone"
      @input="validatePhoneDebounced"
      @keydown.enter="ssnInput?.focus()"
    />

    <BaseInput
      ref="ssnInput"
      v-model="ssn"
      :error="ssnError"
      title="Social Security Number (optional)"
      placeholder="123-45-6789"
      inputmode="numeric"
      :maxlength="11"
      autocomplete="off"
      secret
      @blur="validateSsn"
      @input="validateSsnDebounced"
      @keydown.enter="addressInput?.focus()"
    >
      <template #label-after>
        <BaseIcon
          name="info"
          class="enrollment-v2-monitoring__label-after-icon"
          @click="showWhyDoINeedThis"
        />
      </template>
    </BaseInput>

    <EnrollmentAddressInput
      ref="addressInput"
      v-model="addressString"
      :error="addressError"
      title="Address*"
      :title-after="
        showAddressManual ? 'Use autocomplete' : `Can't find your address?`
      "
      placeholder="Search and select your address"
      autocomplete="street-address"
      :class="{
        'enroll-v2__hide-input': showAddressManual || !!formattedPrimaryAddress,
      }"
      @input="addressError = null"
      @blur="validateAddresses"
      @click-action="onAddAddress"
      @click-title-after="toggleAddressManual"
    />

    <EnrollmentTags>
      <EnrollmentTag
        v-if="formattedPrimaryAddress && !showAddressManual"
        :key="formattedPrimaryAddress.display"
        tabindex="0"
        @click="onRemoveAddress"
      >
        {{ formattedPrimaryAddress.display }}
      </EnrollmentTag>
    </EnrollmentTags>

    <PageEnrollmentAddressesManual
      v-if="showAddressManual"
      ref="manualAddressComponent"
      :is-full-page="false"
      @complete="onAddAddress"
    />

    <EnrollmentAgreement
      v-model="agreesWithTerms"
      class="page-enrollment-confirm__agreement"
      :first-name="firstName"
      :last-name="lastName"
    />
    <BaseButton
      variant="primary"
      size="lg"
      :full-width="true"
      class="enroll-v2__button"
      :disabled="!isFormValid"
      :loading="isSubmitting"
      @click="handleSubmit"
    >
      Confirm and Protect
    </BaseButton>
  </div>
</template>
<style lang="scss" scoped>
.enroll-v2 {
  max-width: 425px;
  height: 100%;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__hide-input {
    :deep(.base-input__input) {
      display: none;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    max-width: 425px;

    &:deep(.base-input__input) {
      &:not(:disabled, :focus, :active, .base-input__input--error) {
        border-color: $color-primary-50;
      }
    }

    &_names {
      display: flex;
      flex-direction: row;
      gap: 16px;
      align-items: flex-start;
      justify-content: space-between;
    }
  }
}
</style>
