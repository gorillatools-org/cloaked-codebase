<script setup>
import DeleteFlowHeader from "@/features/data-delete/atoms/DeleteFlowHeader.vue";
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";
import AtomInput from "@/library/AtomInput.vue";
import AtomMultipleInputRow from "@/library/AtomMultipleInputRow.vue";
import AtomTagButton from "@/library/AtomTagButton.vue";

import {
  formatAddressFromObject,
  formatNameFromObject,
} from "@/scripts/format.js";
import InlineSvg from "@/features/InlineSvg.vue";
import Button from "@/features/Button.vue";
import DeleteFlowAddressInput from "@/features/data-delete/atoms/DeleteFlowAddressInput.vue";
import { useToast } from "@/composables/useToast.js";
import { formatPhone } from "@/scripts/format.js";
import AtomGradientPageWrapper from "@/library/AtomGradientPageWrapper.vue";
import { isMobileDevice } from "@/scripts/regex";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_USER_VIEWED_DD_SECONDARY_FORM_INFO,
  PH_EVENT_USER_ADDED_DD_SECONDARY_FORM_INFO,
} from "@/scripts/posthogEvents.js";
import { useNameValidation } from "@/composables/validation/useNameValidation.js";
import { usePhoneValidation } from "@/composables/validation/usePhoneValidation.js";
import { useEmailValidation } from "@/composables/validation/useEmailValidation.js";
import { useAddressValidation } from "@/features/data-delete/composables/useAddressValidation.js";

const toast = useToast();

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
});

function updateFooter() {
  requestAnimationFrame(() => {
    const footer = document.getElementById("sticky-footer");
    footer.style.bottom = `${window.innerHeight - window.visualViewport.height}px`;
  });
}

onMounted(() => {
  if (isMobileDevice) {
    window.addEventListener("scroll", updateFooter);
    window.visualViewport.addEventListener("resize", updateFooter);
  }

  addressInputRef?.value?.inputField?.atomInputRef?.focus();

  posthogCapture(PH_EVENT_USER_VIEWED_DD_SECONDARY_FORM_INFO, {
    field: "address",
  });
});

onBeforeUnmount(() => {
  if (isMobileDevice) {
    window.removeEventListener("scroll", updateFooter);
    window.visualViewport.removeEventListener("resize", updateFooter);
  }
});

const emit = defineEmits(["done", "updateRequest"]);

const step = ref(1);
const addressInputRef = ref(null);
const nameInputRef = ref(null);
const phoneInputRef = ref(null);

function updateRequest(newRequest) {
  emit("updateRequest", newRequest);
}

function addAddress() {
  validateAddress();

  if (!addressError.value) {
    updateRequest({
      ...props.request,
      addresses: [...props.request.addresses, address.value],
    });

    addressInputRef.value?.reset();

    posthogCapture(PH_EVENT_USER_ADDED_DD_SECONDARY_FORM_INFO, {
      field: "address",
    });
  }
}

function removeAddress(idx) {
  if (props.request.addresses.length === 1) {
    return toast.error("You must have at least one address");
  }
  const filteredAddresses = props.request.addresses.filter((_, i) => i !== idx);

  updateRequest({ ...props.request, addresses: filteredAddresses });
}

// name

function addName() {
  validateNameForm();

  if (!isNameFormValid.value) {
    return;
  }

  const nameObject = {
    prefix: namePrefix.value || null,
    suffix: nameSuffix.value || null,
    first: firstName.value || null,
    middle: middleName.value || null,
    last: lastName.value || null,
  };

  if (Object.values(props.request.name).filter(Boolean).length === 0) {
    updateRequest({ ...props.request, name: nameObject });
  } else {
    updateRequest({
      ...props.request,
      other_names: [...props.request.other_names, nameObject],
    });
  }

  namePrefix.value = null;
  nameSuffix.value = null;
  firstName.value = null;
  middleName.value = null;
  lastName.value = null;

  posthogCapture(PH_EVENT_USER_ADDED_DD_SECONDARY_FORM_INFO, { field: "name" });
}

function removeName(idx) {
  if (idx === 0) {
    // if removing main name
    if (props.request.other_names.length > 0) {
      // replace main name with first other name
      const firstOtherName = [...props.request.other_names].shift();
      return updateRequest({
        ...props.request,
        name: firstOtherName,
        other_names: props.request?.other_names?.slice(1),
      });
    } else {
      // else clear main name
      return toast.error("You must have at least one name");
    }
  } else {
    // if removing from other name array
    const filteredNames = props.request.other_names.filter(
      (_, i) => i !== idx - 1
    );

    updateRequest({ ...props.request, other_names: filteredNames });
  }
}

// phone email

function addPhoneEmail() {
  let requestCopy = { ...props.request };

  validatePhone();
  validateEmail();

  if (phone.value && !phoneError.value) {
    requestCopy = {
      ...requestCopy,
      phone_numbers: [...props.request.phone_numbers, phone.value],
    };

    phone.value = null;

    posthogCapture(PH_EVENT_USER_ADDED_DD_SECONDARY_FORM_INFO, {
      field: "phone number",
    });
  }

  if (email.value && !emailError.value) {
    requestCopy = {
      ...requestCopy,
      email_addresses: [...props.request.email_addresses, email.value],
    };

    email.value = null;

    posthogCapture(PH_EVENT_USER_ADDED_DD_SECONDARY_FORM_INFO, {
      field: "email",
    });
  }

  updateRequest(requestCopy);
}
function removePhone(phone) {
  if (props.request.phone_numbers.length === 1) {
    return toast.error("You must have at least one phone number");
  }
  const filteredPhones = props.request.phone_numbers.filter(
    (phoneNum) => phoneNum !== phone
  );
  updateRequest({ ...props.request, phone_numbers: filteredPhones });
}

function removeEmail(email) {
  if (props.request.email_addresses.length === 1) {
    return toast.error("You must have at least one email address");
  }
  const filteredEmails = props.request.email_addresses.filter(
    (emailAdd) => emailAdd !== email
  );
  updateRequest({ ...props.request, email_addresses: filteredEmails });
}

function goNext() {
  if (step.value === 3) {
    close();
    return;
  }
  step.value = step.value + 1;
  switch (step.value) {
    case 2:
      nextTick(() => {
        nameInputRef.value?.atomInputRef?.focus();
        posthogCapture(PH_EVENT_USER_VIEWED_DD_SECONDARY_FORM_INFO, {
          field: "name",
        });
      });
      break;
    case 3:
      nextTick(() => {
        phoneInputRef.value?.atomInputRef?.focus();
        posthogCapture(PH_EVENT_USER_VIEWED_DD_SECONDARY_FORM_INFO, {
          field: "phone and email",
        });
      });
      break;
  }
}
function goBack() {
  if (step.value === 1) {
    close();
    return;
  }
  step.value = step.value - 1;
  switch (step.value) {
    case 1:
      nextTick(() => {
        addressInputRef?.value?.inputField?.atomInputRef?.focus();
        posthogCapture(PH_EVENT_USER_VIEWED_DD_SECONDARY_FORM_INFO, {
          field: "address",
        });
      });
      break;
    case 2:
      nextTick(() => {
        nameInputRef.value?.atomInputRef?.focus();
        posthogCapture(PH_EVENT_USER_VIEWED_DD_SECONDARY_FORM_INFO, {
          field: "name",
        });
      });
      break;
  }
}

function close() {
  closing.value = true;
  setTimeout(() => {
    emit("done");
  }, 500);
}

const addButtonText = computed(() => {
  if (
    step.value === 2 &&
    (namePrefix.value ||
      nameSuffix.value ||
      firstName.value ||
      middleName.value ||
      lastName.value)
  ) {
    return "Add this name";
  } else if (step.value === 3 && phone.value && email.value) {
    return "Add both items";
  } else if (step.value === 3 && phone.value) {
    return "Add this number";
  } else if (step.value === 3 && email.value) {
    return "Add this email";
  }
  return null;
});

function addData() {
  if (step.value === 2) {
    addName();
  } else if (step.value === 3) {
    addPhoneEmail();
  }
}

const allNames = computed(() => {
  return [props.request.name, ...props.request.other_names];
});
const pastAddresses = computed(() => {
  return props.request?.addresses ?? [];
});
const phoneNumbers = computed(() => {
  return props.request?.phone_numbers ?? [];
});
const emails = computed(() => {
  return props.request?.email_addresses ?? [];
});

const closing = ref(false);

const address = defineModel("address", { type: Object });
const namePrefix = defineModel("namePrefix", { type: String });
const nameSuffix = defineModel("nameSuffix", { type: String });
const firstName = defineModel("firstName", { type: String });
const middleName = defineModel("middleName", { type: String });
const lastName = defineModel("lastName", { type: String });
const phone = defineModel("phone", { type: String });
const email = defineModel("email", { type: String });

const {
  error: namePrefixError,
  validate: validateNamePrefix,
  validateDebounced: validateNamePrefixDebounced,
} = useNameValidation(namePrefix, { isRequired: false });

const {
  error: nameSuffixError,
  validate: validateNameSuffix,
  validateDebounced: validateNameSuffixDebounced,
} = useNameValidation(nameSuffix, { isRequired: false });

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
  error: phoneError,
  validate: validatePhone,
  validateDebounced: validatePhoneDebounced,
} = usePhoneValidation(phone, { isRequired: false });

const {
  error: emailError,
  validate: validateEmail,
  validateDebounced: validateEmailDebounced,
} = useEmailValidation(email, { isRequired: false });

const { error: addressError, validate: validateAddress } =
  useAddressValidation(address);

watch(address, (newValue) => newValue && addAddress());

const validateNameForm = () => {
  validateNamePrefix();
  validateNameSuffix();
  validateFirstName();
  validateMiddleName();
  validateLastName();
};

const isNameFormValid = computed(
  () =>
    !(
      namePrefixError.value ||
      nameSuffixError.value ||
      firstNameError.value ||
      middleNameError.value ||
      lastNameError.value
    )
);
</script>
<template>
  <AtomGradientPageWrapper
    class="delete-flow-add-more-wrapper"
    :class="{ 'animate-close': closing }"
  >
    <div
      class="header-wrap"
      :class="{ 'animate-close': closing }"
    >
      <InlineSvg
        name="arrow-long-left"
        class="back-button"
        @click="goBack"
      />
      <div class="page-tracker">
        <div
          class="page-tracker__step"
          :class="{ wide: step === 1 }"
        />
        <div
          class="page-tracker__step"
          :class="{ wide: step === 2 }"
        />
        <div
          class="page-tracker__step"
          :class="{ wide: step === 3 }"
        />
      </div>

      <InlineSvg
        class="next-button"
        name="modal-x"
        @click="close"
      />
    </div>

    <!-- step 1: addresses -->
    <div
      v-if="step === 1"
      class="content-wrapper"
    >
      <DeleteFlowHeader center>Your past addresses</DeleteFlowHeader>
      <div class="input-title">Search your address</div>
      <DeleteFlowAddressInput
        ref="addressInputRef"
        v-model="address"
        :error="addressError"
        placeholder="Type your street address"
      />
      <div
        v-if="pastAddresses.length"
        class="input-title"
      >
        Past addresses for removal
      </div>
      <div class="label-wrapper">
        <AtomTagButton
          v-for="(physicalAddress, idx) in pastAddresses"
          :key="`address-${idx}`"
          icon="x-circle-outline"
          type="frosted"
          @click="removeAddress(idx)"
        >
          {{ formatAddressFromObject(physicalAddress) }}
        </AtomTagButton>
      </div>
    </div>

    <!-- step 2: names -->
    <div
      v-if="step === 2"
      class="content-wrapper"
    >
      <DeleteFlowHeader center>Other names of yours</DeleteFlowHeader>
      <AtomMultipleInputRow>
        <AtomInput
          ref="nameInputRef"
          class="form-input"
          placeholder="Mr, Mrs, Lord, etc"
          label="Prefix"
          type="text"
          :error="!!namePrefixError"
          errorMessage="Please enter a valid prefix"
          :value="namePrefix"
          @input="
            namePrefix = $event.target.value;
            validateNamePrefixDebounced();
          "
          @blur="validateNamePrefix"
          @keydown.enter="addData"
        />
        <AtomInput
          class="form-input"
          placeholder="Senior, Junior, etc"
          label="Suffix"
          type="text"
          :error="!!nameSuffixError"
          errorMessage="Please enter a valid suffix"
          :value="nameSuffix"
          @input="
            nameSuffix = $event.target.value;
            validateNameSuffixDebounced();
          "
          @blur="validateNameSuffix"
          @keydown.enter="addData"
        />
      </AtomMultipleInputRow>
      <AtomMultipleInputRow>
        <AtomInput
          class="form-input"
          placeholder="First name"
          label="First name*"
          type="text"
          :error="!!firstNameError"
          :errorMessage="firstNameError"
          :value="firstName"
          @input="
            firstName = $event.target.value;
            validateFirstNameDebounced();
          "
          @blur="validateFirstName"
          @keydown.enter="addData"
        />
        <AtomInput
          class="form-input"
          label="Middle name"
          placeholder="Middle name"
          type="text"
          :error="!!middleNameError"
          :errorMessage="middleNameError"
          :value="middleName"
          @input="
            middleName = $event.target.value;
            validateMiddleNameDebounced();
          "
          @blur="validateMiddleName"
          @keydown.enter="addData"
        />
      </AtomMultipleInputRow>
      <AtomInput
        class="form-input"
        placeholder="Last name"
        label="Last name*"
        type="text"
        :error="!!lastNameError"
        :errorMessage="lastNameError"
        :value="lastName"
        @input="
          lastName = $event.target.value;
          validateLastNameDebounced();
        "
        @blur="validateLastName"
        @keydown.enter="addData"
      />
      <div
        v-if="allNames.length"
        class="input-title"
      >
        Names for removal
      </div>
      <div class="label-wrapper">
        <AtomTagButton
          v-for="(name, idx) in allNames"
          :key="`name-${idx}`"
          icon="x-circle-outline"
          type="frosted"
          @click="removeName(idx)"
        >
          {{ formatNameFromObject(name) }}
        </AtomTagButton>
      </div>
    </div>

    <!-- step 3: phone/email -->
    <div
      v-if="step === 3"
      class="content-wrapper"
    >
      <DeleteFlowHeader center>Add other contact info</DeleteFlowHeader>
      <AtomInput
        ref="phoneInputRef"
        class="form-input"
        placeholder="Type a phone number"
        type="tel"
        label="US Phone Numbers Only"
        :error="!!phoneError"
        :errorMessage="phoneError"
        :value="phone"
        @input="
          phone = $event.target.value;
          validatePhoneDebounced();
        "
        @blur="validatePhone"
        @keydown.enter="addData"
      />
      <AtomInput
        class="form-input"
        placeholder="Type an email address"
        type="email"
        label="Email Address"
        :error="!!emailError"
        :errorMessage="emailError"
        :value="email"
        @input="
          email = $event.target.value;
          validateEmailDebounced();
        "
        @blur="validateEmail"
        @keydown.enter="addData"
      />

      <div
        v-if="phoneNumbers.length || emails.length"
        class="input-title"
      >
        Contact info for removal
      </div>
      <div class="label-wrapper">
        <AtomTagButton
          v-for="(phoneNumber, idx) in phoneNumbers"
          :key="`phone-${idx}`"
          icon="x-circle-outline"
          type="frosted"
          @click="removePhone(phoneNumber)"
        >
          {{ formatPhone(phoneNumber) }}
        </AtomTagButton>
        <AtomTagButton
          v-for="(emailAddress, idx) in emails"
          :key="`email-${idx}`"
          textTransform="lowercase"
          icon="x-circle-outline"
          type="frosted"
          @click="removeEmail(emailAddress)"
        >
          {{ emailAddress.toLowerCase() }}
        </AtomTagButton>
      </div>
    </div>
    <div id="sticky-footer">
      <Button
        v-if="addButtonText"
        size="lg"
        class="sticky-button"
        @click="addData"
      >
        {{ addButtonText }}
        <InlineSvg
          name="add-circle"
          class="sticky-icon"
        />
      </Button>
      <Button
        v-else-if="step === 3"
        size="lg"
        type="hero-green"
        class="sticky-button"
        @click="goNext"
      >
        Done
        <InlineSvg
          name="checkmark"
          class="sticky-icon"
        />
      </Button>
      <Button
        v-else
        size="lg"
        class="sticky-button sticky-button--secondary"
        @click="goNext"
      >
        Continue
        <InlineSvg
          name="arrow-long-right"
          class="sticky-icon"
        />
      </Button>
    </div>
  </AtomGradientPageWrapper>
</template>
<style scoped lang="scss">
#sticky-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 18px 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media all and (min-width: $screen-md) {
    padding: 35px 0;
    justify-content: center;
    max-width: unset;
  }
}

.sticky-button {
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;

  @media all and (min-width: $screen-md) {
    min-width: 328px;
    height: 60px;
  }

  &:hover {
    opacity: 0.9;
  }

  &--secondary {
    background: rgb(255 255 255 / 20%);
    color: $color-primary-100;
    backdrop-filter: blur(12px);
  }
}

.sticky-icon {
  width: 16px;
  height: 16px;
}

.delete-flow-add-more-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 64px 24px 0;
  z-index: 1000;
  height: 100dvh;
  width: 100vw;
  overflow: scroll;

  @keyframes fade-in {
    0% {
      opacity: 0.8;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes fade-out {
    0% {
      opacity: 1;
    }

    100% {
      opacity: 0.5;
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

  @keyframes slide-down {
    0% {
      margin-top: 0;
    }

    100% {
      margin-top: 20px;
    }
  }

  animation: slide-up 0.5s ease-in-out forwards;

  &.animate-close {
    animation:
      slide-down 0.5s ease-in-out forwards,
      fade-out 0.5s ease-in-out forwards;
  }

  .header-wrap {
    animation: slide-up 0.5s ease-in-out forwards;
    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: $color-primary-100;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba($white, 0.07);
    background-blend-mode: overlay;
    backdrop-filter: blur(27px);
    height: 64px;
    padding: 0 24px;
    z-index: 1001;

    &.animate-close {
      animation:
        slide-down 0.5s ease-in-out forwards,
        fade-out 0.5s ease-in-out forwards;
    }

    .page-tracker {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 4px;

      .page-tracker__step {
        height: 8px;
        width: 8px;
        border-radius: 50%;
        background-color: rgba($white, 0.15);

        @at-root .theme-light & {
          background-color: rgba($black, 0.15);
        }

        &.wide {
          border-radius: 115px;
          width: 16px;
          background-color: $color-primary-100;
        }
      }
    }

    .back-button,
    .next-button {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      opacity: 0.9;
      transition: all 0.3s;
      height: auto;
      width: 18px;

      &.success {
        color: $color-success;
      }

      &:hover {
        transform: scale(1.02);
        opacity: 1;
        transition: all 0.3s;
      }
    }

    .back-button {
      height: auto;
      width: 24px;
    }
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  width: 100%;
  max-width: 550px;
  padding-top: 44px;
  padding-bottom: 75px;
}

.label-wrapper {
  display: flex;
  flex-flow: row wrap;
  gap: 4px;
  align-items: center;
  justify-content: flex-start;
  z-index: 10;

  .label-block {
    display: flex;
    padding: 8px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 9px;
    background: rgba($white, 0.1);
    color: $color-primary-100;
    transition: all 0.3s;
    cursor: pointer;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;

    svg {
      flex-shrink: 0;
    }

    &.capitilize {
      text-transform: capitalize;
    }

    &:hover {
      transform: scale(1.02);
      transition: all 0.3s;
    }
  }
}

.input-title {
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  color: $color-primary-100;
  margin-top: 6px;
}

.form-input {
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
}
</style>
