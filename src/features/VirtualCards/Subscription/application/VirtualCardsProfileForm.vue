<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  nextTick,
  watch,
  onUnmounted,
  onMounted,
} from "vue";
import BaseInput from "@/library/BaseInput.vue";
import BaseText from "@/library/BaseText.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import VirtualCardsAddressInput, {
  type AddressAutocomplete,
} from "@/features/VirtualCards/VirtualCardsAddressInput.vue";
import { StateList } from "@/scripts/countries/states";
import moment from "moment";
import { usePersonalNameValidation } from "@/composables/validation/usePersonalNameValidation";
import { useEmailValidation } from "@/composables/validation/useEmailValidation";
import { useValidation } from "@/composables/validation/useValidation";
import { phone as isValidPhone } from "@/scripts/validation";
import VirtualCardsProfileManualAddressForm from "./VirtualCardsProfileManualAddressForm.vue";
import { displayAddress } from "@/features/enrollment/composables";

export type ProfileFormData = {
  firstName: string;
  lastName: string;
  dob: string; // MM/DD/YYYY
  address: AddressAutocomplete;
  phone: string; // +1 (XXX) XXX-XXXX
  email: string;
};

const props = withDefaults(
  defineProps<{
    scrollContainerId?: string;
    isLoading?: boolean;
    allowedSearchCountries?: string[];
    dobSupportText?: string;
    nameSupportText?: string;
    usOnly?: boolean;
    showSuiteField?: boolean;
  }>(),
  {
    scrollContainerId: undefined,
    isLoading: false,
    allowedSearchCountries: () => ["us", "ca"],
    dobSupportText: undefined,
    nameSupportText: undefined,
    usOnly: true,
    showSuiteField: false,
  }
);

const emit = defineEmits<{
  (
    e: "select-address",
    payload: {
      address1: string;
      address2?: string | null;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    }
  ): void;
  (e: "input-focus"): void;
  (e: "input-blur"): void;
  (e: "submit"): void;
}>();

const formRootRef = ref<HTMLElement | null>(null);

const firstNameInputRef = ref<InstanceType<typeof BaseInput>>();
const lastNameInputRef = ref<InstanceType<typeof BaseInput>>();
const dobInputRef = ref<InstanceType<typeof BaseInput>>();
const streetInputRef = ref<InstanceType<typeof VirtualCardsAddressInput>>();
const manualAddressFormRef = ref<InstanceType<
  typeof VirtualCardsProfileManualAddressForm
> | null>(null);
const phoneInputRef = ref<InstanceType<typeof BaseInput>>();
const emailInputRef = ref<InstanceType<typeof BaseInput>>();

const data = reactive<ProfileFormData>({
  firstName: "",
  lastName: "",
  dob: "",
  address: {
    address1: "",
    address2: null,
    postal_code: "",
    city: "",
    state: "",
    country: "",
  },
  phone: "",
  email: "",
});

const addressSearch = ref<string>("");
const showManualAddress = ref(false);

const firstNameTouched = ref(false);
const lastNameTouched = ref(false);
const dobTouched = ref(false);
const addressSearchTouched = ref(false);
const phoneTouched = ref(false);
const emailTouched = ref(false);

onMounted(() => {
  formRootRef.value?.addEventListener("focusin", onInputFocus);
  formRootRef.value?.addEventListener("focusout", onInputBlur);
});

onUnmounted(() => {
  formRootRef.value?.removeEventListener("focusin", onInputFocus);
  formRootRef.value?.removeEventListener("focusout", onInputBlur);
});

const dobForValidation = computed(() => data.dob.split("/").join("-"));

const selectedAddressDisplay = computed(() => {
  if (showManualAddress.value) {
    return undefined;
  }

  return displayAddress(data.address);
});

const {
  error: firstNameError,
  validate: validateFirstName,
  validateDebounced: validateFirstNameDebounced,
} = usePersonalNameValidation(() => data.firstName, {
  debounceTimeout: 100,
  isRequired: true,
});

const {
  error: lastNameError,
  validate: validateLastName,
  validateDebounced: validateLastNameDebounced,
} = usePersonalNameValidation(() => data.lastName, {
  debounceTimeout: 100,
  isRequired: true,
});

const {
  error: dobError,
  validate: validateDob,
  validateDebounced: validateDobDebounced,
} = useValidation(
  () => dobForValidation.value,
  { debounceTimeout: 100 },
  (dateOfBirth) => {
    if (!dateOfBirth || String(dateOfBirth).trim().length === 0) {
      return "Date of birth is required";
    }

    const date = moment(dateOfBirth, "MM-DD-YYYY", true);
    const now = moment();

    if (
      !date.isValid() ||
      now.diff(date, "years") < 0 ||
      now.diff(date, "years") > 100
    ) {
      return "Please provide a valid date (MM/DD/YYYY)";
    }

    if (now.diff(date, "years") < 18) {
      return "You must be at least 18 years old";
    }

    return null;
  }
);

const {
  error: phoneError,
  validate: validatePhone,
  validateDebounced: validatePhoneDebounced,
} = useValidation(
  () => data.phone,
  { debounceTimeout: 100, isRequired: true },
  (value, { isRequired }) => {
    if (!isRequired && !value) return null;
    if (!value) return "Phone number is required";
    if (!String(value).startsWith("+1"))
      return "Phone number must start with +1";
    const digits = String(value).replace(/\D/g, "");
    if (!/^1\d{10}$/.test(digits)) return "Please provide a valid phone number";
    const valid = isValidPhone(value, "US");
    return valid ? null : "Please provide a valid phone number";
  }
);

const {
  error: emailError,
  validate: validateEmail,
  validateDebounced: validateEmailDebounced,
} = useEmailValidation(() => data.email, {
  debounceTimeout: 100,
  isRequired: true,
});

const {
  error: addressSearchError,
  validate: validateStreet,
  validateDebounced: validateStreetDebounced,
} = useValidation(
  () => data.address.address1,
  { debounceTimeout: 100, isRequired: true },
  (value) => {
    if (!value || String(value).trim().length === 0)
      return "Physical address is required";
    return null;
  }
);

function onInputFocus() {
  emit("input-focus");
}

function onInputBlur() {
  emit("input-blur");
}

function formatAutofillDob(input?: string) {
  if (!input) return "";
  const trimmed = String(input).trim();
  if (!trimmed) return "";
  let m = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) {
    const [, mo, d, y] = m;
    return `${mo}/${d}/${y}`;
  }
  m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [, y, mo, d] = m;
    return `${mo}/${d}/${y}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  return trimmed;
}

function formatPhoneCountryCode(input?: string | null): string {
  if (!input) return "";
  const raw = String(input);
  const digits = raw.replace(/\D/g, "");
  let national = digits.startsWith("1") ? digits.slice(1) : digits;
  national = national.slice(0, 10);
  if (national.length < 10) return "";
  return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6, 10)}`;
}

function formatDate(event: Event & { target: HTMLInputElement }) {
  const input = event.target;
  let value = input.value.replace(/\D/g, "");
  if (value.length >= 2) value = value.slice(0, 2) + "/" + value.slice(2);
  if (value.length >= 5) value = value.slice(0, 5) + "/" + value.slice(5);
  if (value.length > 10) value = value.slice(0, 10);
  data.dob = value;
  const cursorPos = value.length;
  input.setSelectionRange(cursorPos, cursorPos);
  validateDobDebounced();
}

function handleDateBackspace(
  event: KeyboardEvent & { target: HTMLInputElement }
) {
  const input = event.target;
  const cursorPosition = input.selectionStart || 0;
  const currentValue = input.value;
  if (event.key !== "Backspace") return;
  if (cursorPosition > 0 && currentValue[cursorPosition - 1] === "/") {
    event.preventDefault();
    const newValue =
      currentValue.slice(0, cursorPosition - 2) +
      currentValue.slice(cursorPosition);
    data.dob = newValue;
    setTimeout(() => {
      const pos = cursorPosition - 2;
      input.setSelectionRange(pos, pos);
    }, 0);
  }
}

function onlyNumbers(event: KeyboardEvent) {
  const key = event.key;
  if (key === "Backspace") return;
  if (isNaN(Number(key))) event.preventDefault();
}

function focusNextInput(
  currentInput: "firstName" | "lastName" | "dob" | "address" | "phone" | "email"
) {
  const nextInputMap: Record<string, () => void> = {
    firstName: () => lastNameInputRef.value?.focus(),
    lastName: () => dobInputRef.value?.focus(),
    dob: () => {
      if (!showManualAddress.value) {
        streetInputRef.value?.focus();
      }
    },
    address: () => phoneInputRef.value?.focus(),
    phone: () => emailInputRef.value?.focus(),
    email: () => {
      emailInputRef.value?.blur();
      emit("submit");
    },
  };

  nextInputMap[currentInput]?.();
}

function toggleManualAddress() {
  data.address.address1 = "";
  addressSearchTouched.value = false;
  addressSearchError.value = null;

  showManualAddress.value = !showManualAddress.value;

  addressSearch.value = "";
  data.address.city = "";
  data.address.postal_code = "";
  data.address.state = "";

  removeSelectedAddress();

  if (!showManualAddress.value) {
    nextTick(() => {
      streetInputRef.value?.focus();
    });
  }
}

function removeSelectedAddress() {
  data.address.address1 = "";
  data.address.country = "";
  data.address.address2 = null;
  data.address.postal_code = "";
  data.address.city = "";
  data.address.state = "";
}

function onAddressInput() {
  if (selectedAddressDisplay.value) {
    addressSearchTouched.value = true;
    removeSelectedAddress();
    return;
  }
}

function onSelectAddress(address: AddressAutocomplete) {
  data.address.address1 = address.address1 || "";
  data.address.address2 = address.address2 || null;
  data.address.country = address.country || "";
  data.address.postal_code = address.postal_code || "";
  data.address.city = address.city || "";
  data.address.state = address.state || "";

  addressSearchTouched.value = true;
  addressSearchError.value = null;

  emit("select-address", address);
}

function onDobInput(e: Event & { target: HTMLInputElement }) {
  formatDate(e);
}

function onDobBlur() {
  dobTouched.value = true;
  validateDob();
}

function onFirstNameBlur() {
  firstNameTouched.value = true;
  validateFirstName();
}

function onLastNameBlur() {
  lastNameTouched.value = true;
  validateLastName();
}

function onAddressBlur() {
  addressSearchTouched.value = true;
  validateStreet();
}

function onEmailBlur() {
  emailTouched.value = true;
  validateEmail();
}

function onPhoneBlur() {
  phoneTouched.value = true;
  validatePhone();
}

function onPhoneInput(e: Event & { target: HTMLInputElement }) {
  const input = e.target;
  const rawValue = input.value || "";
  const prefix = "+1 ";
  const caret = input.selectionStart ?? rawValue.length;
  let digitsBeforeCaret = (rawValue.slice(0, caret).match(/\d/g) || []).length;
  if (rawValue.startsWith(prefix) && caret > prefix.length) {
    digitsBeforeCaret = Math.max(0, digitsBeforeCaret - 1);
  }
  const digits = rawValue.replace(/\D/g, "");
  let national = digits.startsWith("1") ? digits.slice(1) : digits;
  national = national.slice(0, 10);
  if (national.length === 0) {
    if (digits === "1") {
      data.phone = prefix;
      requestAnimationFrame(() => {
        input.setSelectionRange(prefix.length, prefix.length);
      });
      if (phoneError.value) validatePhoneDebounced();
      return;
    }
    data.phone = "";
    if (phoneError.value) validatePhoneDebounced();
    return;
  }
  let formatted = national;
  if (national.length > 0 && national.length <= 3) {
    formatted = `(${national}` + (national.length === 3 ? ")" : "");
  }
  if (national.length > 3 && national.length <= 6) {
    formatted = `(${national.slice(0, 3)}) ${national.slice(3)}`;
  }
  if (national.length > 6) {
    formatted = `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6, 10)}`;
  }
  const masked = `${prefix}${formatted}`.trim();
  data.phone = masked;

  const calcCaretFromDigitIndex = (
    text: string,
    nationalDigitIndex: number
  ) => {
    if (nationalDigitIndex <= 0) return prefix.length;
    let seenCountryDigit = false;
    let count = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (/\d/.test(ch)) {
        if (!seenCountryDigit) {
          seenCountryDigit = true;
          continue;
        }
        count++;
        if (count === nationalDigitIndex) return i + 1;
      }
    }
    return text.length;
  };
  const nextCaret = calcCaretFromDigitIndex(masked, digitsBeforeCaret);
  requestAnimationFrame(() => {
    input.setSelectionRange(nextCaret, nextCaret);
  });
  if (phoneError.value) validatePhoneDebounced();
}

function handlePhoneBackspace(
  event: KeyboardEvent & { target: HTMLInputElement }
) {
  if (event.key !== "Backspace") return;
  const input = event.target;
  const value = input.value || "";
  const selStart = input.selectionStart ?? 0;
  const selEnd = input.selectionEnd ?? selStart;
  const cursor = selStart;
  if (selEnd !== selStart) return;
  const prefix = "+1 ";
  if (cursor <= prefix.length) {
    event.preventDefault();
    return;
  }
  const prevChar = value[cursor - 1];
  if ([" ", "(", ")", "-"].includes(prevChar)) {
    event.preventDefault();
    const digits = value.replace(/\D/g, "");
    const digitsBefore = (value.slice(0, cursor).match(/\d/g) || []).length;
    const newDigits =
      digits.slice(0, Math.max(0, digitsBefore - 1)) +
      digits.slice(digitsBefore);
    let national = newDigits.startsWith("1") ? newDigits.slice(1) : newDigits;
    national = national.slice(0, 10);
    let formatted = national;
    if (national.length > 0 && national.length <= 3) {
      formatted = `(${national}` + (national.length === 3 ? ")" : "");
    }
    if (national.length > 3 && national.length <= 6) {
      formatted = `(${national.slice(0, 3)}) ${national.slice(3)}`;
    }
    if (national.length > 6) {
      formatted = `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6, 10)}`;
    }
    data.phone = `+1 ${formatted}`.trim();
    requestAnimationFrame(() => {
      const newValue = input.value;
      const calcCaretFromDigitIndex = (text: string, digitIndex: number) => {
        if (digitIndex <= 0) return prefix.length;
        let count = 0;
        for (let i = 0; i < text.length; i++) {
          if (/\d/.test(text[i])) {
            count++;
            if (count === digitIndex) return i + 1;
          }
        }
        return text.length;
      };
      const nextCaret = calcCaretFromDigitIndex(
        newValue,
        Math.max(0, digitsBefore - 1)
      );
      input.setSelectionRange(nextCaret, nextCaret);
    });
  }
}

function focusFirstInvalidInput() {
  const footerEl = document.querySelector(
    ".vc-application-details-form__footer"
  ) as HTMLElement | null;
  const offset = 16 + (footerEl?.getBoundingClientRect().height || 0);

  const fields: Array<{
    invalid: boolean;
    getEl: () => HTMLElement | undefined;
  }> = [
    {
      invalid: !!firstNameError.value,
      getEl: () => firstNameInputRef.value?.input as HTMLElement | undefined,
    },
    {
      invalid: !!lastNameError.value,
      getEl: () => lastNameInputRef.value?.input as HTMLElement | undefined,
    },
    {
      invalid: !!dobError.value,
      getEl: () => dobInputRef.value?.input as HTMLElement | undefined,
    },
    {
      invalid: !!addressSearchError.value,
      getEl: () => streetInputRef.value?.input as HTMLElement | undefined,
    },
    {
      invalid: !!phoneError.value,
      getEl: () => phoneInputRef.value?.input as HTMLElement | undefined,
    },
    {
      invalid: !!emailError.value,
      getEl: () => emailInputRef.value?.input as HTMLElement | undefined,
    },
  ];

  const firstInvalid = fields.find((c) => c.invalid);
  if (!firstInvalid) return;
  const el = firstInvalid.getEl();
  if (!el) return;

  const row = (el.closest &&
    el.closest(".vc-profile-form__row")) as HTMLElement | null;
  const target = row || el;

  const doScroll = () => {
    const cont: HTMLElement | null =
      typeof document !== "undefined"
        ? props.scrollContainerId
          ? (document.getElementById(
              props.scrollContainerId
            ) as HTMLElement | null)
          : document.body
        : null;

    if (cont && cont !== document.body) {
      const containerRect = cont.getBoundingClientRect();
      const rowRect = target.getBoundingClientRect();
      const top = cont.scrollTop + rowRect.top - containerRect.top - offset;
      cont.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      return;
    }

    const rect = target.getBoundingClientRect();
    const top = window.pageYOffset + rect.top - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  doScroll();
  nextTick(doScroll);
  el?.focus();
}

function markAllTouched() {
  firstNameTouched.value = true;
  lastNameTouched.value = true;
  dobTouched.value = true;
  addressSearchTouched.value = true;
  phoneTouched.value = true;
  emailTouched.value = true;
}

function resetTouched() {
  firstNameTouched.value = false;
  lastNameTouched.value = false;
  dobTouched.value = false;
  addressSearchTouched.value = false;
  phoneTouched.value = false;
  emailTouched.value = false;
}

function markFilledFieldsAsTouched() {
  if (data.firstName) firstNameTouched.value = true;
  if (data.lastName) lastNameTouched.value = true;
  if (data.dob) dobTouched.value = true;
  if (data.address.address1) addressSearchTouched.value = true;
  if (data.phone) phoneTouched.value = true;
  if (data.email) emailTouched.value = true;
}

function getValues(): ProfileFormData {
  const normalizeZip = (zip: string) => {
    const digits = (zip || "").replace(/\D/g, "");
    if (digits.length >= 9)
      return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
    return digits.slice(0, 5);
  };

  const normalizeState = (incoming: string) => {
    const s = (incoming || "").trim();
    const byValue = StateList.find((st) => st.value === s);
    const byLabel = StateList.find(
      (st) => st.label.toLowerCase() === s.toLowerCase()
    );
    return byValue?.value || byLabel?.value || s;
  };

  const values: ProfileFormData = {
    firstName: (data.firstName || "").trim(),
    lastName: (data.lastName || "").trim(),
    dob: data.dob || "",
    address: data.address,
    phone: data.phone,
    email: (data.email || "").trim(),
  };

  if (showManualAddress.value && manualAddressFormRef.value) {
    const manual = manualAddressFormRef.value.getValues?.();
    if (manual) {
      values.address.country = manual.country || "US";
      values.address.address1 = (manual.address1 || "").trim();
      values.address.address2 = manual.address2 || null;
      values.address.postal_code = normalizeZip(manual.postal_code || "");
      values.address.city = (manual.city || "").trim();
      values.address.state = normalizeState(manual.state || "");
    }
  }

  return values;
}

function setValues(values: Partial<ProfileFormData> | ProfileFormData) {
  const newValues = { ...values } as Partial<ProfileFormData>;

  if (newValues.address) {
    newValues.address = { ...newValues.address };
  }

  if (typeof newValues.dob !== "undefined")
    newValues.dob = formatAutofillDob(newValues.dob);
  if (typeof newValues.phone !== "undefined")
    newValues.phone = formatPhoneCountryCode(newValues.phone);

  if (typeof newValues.address?.state !== "undefined") {
    const s = (newValues.address?.state || "").trim();
    const matchedByValue = StateList.find((st) => st.value === s);
    const matchedByLabel = StateList.find(
      (st) => st.label.toLowerCase() === s.toLowerCase()
    );
    newValues.address.state =
      matchedByValue?.value || matchedByLabel?.value || s;
  }

  if (typeof newValues.address?.postal_code !== "undefined") {
    const digits = (newValues.address?.postal_code || "").replace(/\D/g, "");
    newValues.address.postal_code =
      digits.length > 5
        ? `${digits.slice(0, 5)}-${digits.slice(5, 9)}`
        : digits;
  }

  Object.assign(data, newValues);
  markFilledFieldsAsTouched();

  if (selectedAddressDisplay.value) {
    addressSearch.value = selectedAddressDisplay.value || "";
  }
}

function getErrors(): Record<keyof ProfileFormData, string | null> {
  return {
    firstName: firstNameError.value,
    lastName: lastNameError.value,
    dob: dobError.value,
    address: addressSearchError.value,
    phone: phoneError.value,
    email: emailError.value,
  } as Record<keyof ProfileFormData, string | null>;
}

function validate(): boolean {
  validateFirstName();
  validateLastName();
  validateDob();
  validatePhone();
  validateEmail();

  let addressesValid = false;
  if (showManualAddress.value && manualAddressFormRef.value) {
    addressesValid = !!manualAddressFormRef.value.validate?.();
  } else {
    validateStreet();
    addressesValid = !addressSearchError.value && !!data.address.address1;
  }

  const othersValid =
    !firstNameError.value &&
    !lastNameError.value &&
    !dobError.value &&
    !phoneError.value &&
    !emailError.value;

  return addressesValid && othersValid;
}

function submit(shouldFocusFirstInvalidInput: boolean = true): boolean {
  markAllTouched();
  const valid = validate();
  if (valid) return true;
  if (shouldFocusFirstInvalidInput) {
    nextTick(() => {
      if (
        showManualAddress.value &&
        manualAddressFormRef.value &&
        !manualAddressFormRef.value.validate?.()
      ) {
        manualAddressFormRef.value.focusFirstInvalidInput?.();
      } else {
        focusFirstInvalidInput();
      }
    });
  }
  return false;
}

watch(
  () => data.firstName,
  () => {
    if (firstNameError.value) validateFirstNameDebounced();
  }
);

watch(
  () => data.lastName,
  () => {
    if (lastNameError.value) validateLastNameDebounced();
  }
);

watch(
  () => data.address.address1,
  () => {
    if (addressSearchError.value) validateStreetDebounced();
  }
);

watch(
  () => data.phone,
  () => {
    if (phoneError.value) validatePhoneDebounced();
  }
);

watch(
  () => data.email,
  () => {
    if (emailError.value) validateEmailDebounced();
  }
);

defineExpose({
  getValues,
  setValues,
  submit,
  validate,
  focusFirstInvalidInput,
  markAllTouched,
  resetTouched,
  getErrors,
});
</script>

<template>
  <div
    ref="formRootRef"
    class="vc-profile-form"
  >
    <div class="vc-profile-form__form">
      <div class="vc-profile-form__row">
        <div class="vc-profile-form__col">
          <BaseInput
            ref="firstNameInputRef"
            v-model="data.firstName"
            title="First name"
            :required-mark="true"
            :error="firstNameTouched ? firstNameError : undefined"
            :disabled="props.isLoading"
            inputmode="text"
            enterkeyhint="next"
            placeholder="John"
            @blur="onFirstNameBlur"
            @keydown.enter.prevent="focusNextInput('firstName')"
          >
            <template #after="{ error }">
              <transition name="text-fade">
                <BaseInputFeedback
                  v-if="error"
                  :message="error as string"
                  variant="error"
                  class="base-input__feedback"
                />
              </transition>
            </template>
            <template #right>
              <span
                v-if="props.isLoading"
                class="vc-profile-form__loader"
              />
              <BaseIcon
                v-else-if="
                  firstNameTouched && !firstNameError && data.firstName
                "
                name="check"
                class="vc-profile-form__valid-icon"
              />
            </template>
          </BaseInput>
        </div>
        <div class="vc-profile-form__col">
          <BaseInput
            ref="lastNameInputRef"
            v-model="data.lastName"
            title="Last name"
            :required-mark="true"
            :error="lastNameTouched ? lastNameError : undefined"
            :disabled="props.isLoading"
            inputmode="text"
            enterkeyhint="next"
            placeholder="Stewart"
            @blur="onLastNameBlur"
            @keydown.enter.prevent="focusNextInput('lastName')"
          >
            <template #after="{ error }">
              <transition name="text-fade">
                <BaseInputFeedback
                  v-if="error"
                  :message="error as string"
                  variant="error"
                  class="base-input__feedback"
                />
              </transition>
            </template>
            <template #right>
              <span
                v-if="props.isLoading"
                class="vc-profile-form__loader"
              />
              <BaseIcon
                v-else-if="lastNameTouched && !lastNameError && data.lastName"
                name="check"
                class="vc-profile-form__valid-icon"
              />
            </template>
          </BaseInput>
        </div>
      </div>

      <transition
        v-if="props.nameSupportText"
        name="text-fade"
      >
        <div
          v-if="
            (lastNameTouched ? !lastNameError : true) &&
            (firstNameTouched ? !firstNameError : true)
          "
          class="vc-profile-form__row vc-profile-form__row--no-margin"
        >
          <div class="vc-profile-form__col vc-profile-form__col--full">
            <slot name="name-support">
              <BaseText
                variant="caption-semibold"
                class="vc-profile-form__support-text"
              >
                {{ props.nameSupportText }}
              </BaseText>
            </slot>
          </div>
        </div>
      </transition>

      <div class="vc-profile-form__row">
        <div class="vc-profile-form__col vc-profile-form__col--full">
          <BaseInput
            ref="dobInputRef"
            v-model="data.dob"
            title="Date of birth (MM/DD/YYYY)"
            :required-mark="true"
            :error="dobTouched ? dobError : undefined"
            maxlength="10"
            :disabled="props.isLoading"
            inputmode="numeric"
            enterkeyhint="next"
            placeholder="06/16/1995"
            @input="onDobInput"
            @blur="onDobBlur"
            @keydown.enter.prevent="focusNextInput('dob')"
            @keydown="handleDateBackspace"
            @keypress="onlyNumbers"
          >
            <template #after="{ error }">
              <transition name="text-fade">
                <BaseInputFeedback
                  v-if="error"
                  :message="error as string"
                  variant="error"
                  class="base-input__feedback"
                />
              </transition>
            </template>
            <template #right>
              <span
                v-if="props.isLoading"
                class="vc-profile-form__loader"
              />
              <BaseIcon
                v-else-if="dobTouched && !dobError && data.dob"
                name="check"
                class="vc-profile-form__valid-icon"
              />
            </template>
          </BaseInput>
        </div>
      </div>

      <transition
        v-if="props.dobSupportText"
        name="text-fade"
      >
        <div
          v-if="dobTouched ? !dobError : true"
          class="vc-profile-form__row vc-profile-form__row--no-margin"
        >
          <div class="vc-profile-form__col vc-profile-form__col--full">
            <BaseText
              variant="caption-semibold"
              class="vc-profile-form__support-text"
            >
              {{ props.dobSupportText }}
            </BaseText>
          </div>
        </div>
      </transition>

      <div class="vc-profile-form__row">
        <div class="vc-profile-form__col vc-profile-form__col--full">
          <BaseText
            as="span"
            variant="body-small-medium"
            class="base-input__title vc-profile-form__address-header"
          >
            <span>
              Address
              <span class="vc-profile-form__required-mark">*</span>
            </span>
            <span
              class="vc-profile-form__address-label-after"
              @click="toggleManualAddress"
            >
              {{
                showManualAddress ? "Find address" : `Enter address manually`
              }}
            </span>
          </BaseText>

          <Transition
            name="tag-fade"
            mode="out-in"
          >
            <VirtualCardsAddressInput
              v-if="!showManualAddress"
              ref="streetInputRef"
              v-model="addressSearch"
              :error="
                addressSearchTouched
                  ? addressSearchError || undefined
                  : undefined
              "
              title=""
              placeholder="1234 Broadway Ave"
              class="vc-profile-form__address-search"
              autocomplete="street-address"
              enterkeyhint="next"
              :disabled="props.isLoading"
              :countries="props.allowedSearchCountries"
              @click-action="onSelectAddress"
              @blur="onAddressBlur"
              @input="onAddressInput"
              @enter="focusNextInput('address')"
            >
              <template #right>
                <span
                  v-if="props.isLoading"
                  class="vc-profile-form__loader"
                />
                <BaseIcon
                  v-else-if="
                    addressSearchTouched &&
                    !addressSearchError &&
                    selectedAddressDisplay
                  "
                  name="check"
                  class="vc-profile-form__valid-icon"
                />
              </template>
            </VirtualCardsAddressInput>
            <div
              v-else-if="!selectedAddressDisplay && showManualAddress"
              class="vc-profile-form__manual-address-container"
              :class="{
                'vc-profile-form__manual-address-container--show':
                  showManualAddress,
              }"
            >
              <VirtualCardsProfileManualAddressForm
                ref="manualAddressFormRef"
                :is-loading="props.isLoading"
                :us-only="props.usOnly"
                :show-suite-field="props.showSuiteField"
              />
            </div>
          </Transition>
        </div>
      </div>

      <div class="vc-profile-form__row">
        <div class="vc-profile-form__col vc-profile-form__col--full">
          <BaseInput
            ref="phoneInputRef"
            v-model="data.phone"
            title="Phone number"
            :required-mark="true"
            :error="phoneTouched ? phoneError : undefined"
            type="tel"
            :disabled="props.isLoading"
            inputmode="numeric"
            enterkeyhint="next"
            placeholder="+1 (615) 999-5810"
            @input="onPhoneInput"
            @keydown.enter.prevent="focusNextInput('phone')"
            @keydown="handlePhoneBackspace"
            @blur="onPhoneBlur"
          >
            <template #after="{ error }">
              <transition name="text-fade">
                <BaseInputFeedback
                  v-if="error"
                  :message="error as string"
                  variant="error"
                  class="base-input__feedback"
                />
              </transition>
            </template>
            <template #right>
              <span
                v-if="props.isLoading"
                class="vc-profile-form__loader"
              />
              <BaseIcon
                v-else-if="phoneTouched && !phoneError && data.phone"
                name="check"
                class="vc-profile-form__valid-icon"
              />
            </template>
          </BaseInput>
        </div>
      </div>

      <div class="vc-profile-form__row">
        <div class="vc-profile-form__col vc-profile-form__col--full">
          <BaseInput
            ref="emailInputRef"
            v-model="data.email"
            title="Email address"
            :required-mark="true"
            :error="emailTouched ? emailError : undefined"
            type="email"
            :disabled="props.isLoading"
            inputmode="email"
            enterkeyhint="done"
            placeholder="johnkstewart@gmail.com"
            @blur="onEmailBlur"
            @keydown.enter.prevent="focusNextInput('email')"
          >
            <template #after="{ error }">
              <transition name="text-fade">
                <BaseInputFeedback
                  v-if="error"
                  :message="error as string"
                  variant="error"
                  class="base-input__feedback"
                />
              </transition>
            </template>
            <template #right>
              <span
                v-if="props.isLoading"
                class="vc-profile-form__loader"
              />
              <BaseIcon
                v-else-if="emailTouched && !emailError && data.email"
                name="check"
                class="vc-profile-form__valid-icon"
              />
            </template>
          </BaseInput>
        </div>
      </div>
      <slot name="additional-fields" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.vc-profile-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;

  &__form {
    width: 100%;

    :deep(.base-input__input),
    :deep(.base-select__select) {
      border: 1.5px solid $color-overlay-neutral-15;
      height: 56px;
      border-radius: 12px;

      &:focus {
        border-color: $color-neutral-1000;
      }
    }
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
    margin-top: 16px;

    &--no-margin {
      margin-top: 0;
    }
  }

  &__col {
    &--full {
      grid-column: 1 / -1;
    }
  }

  &__address-search {
    :deep(.base-input__input) {
      width: 100%;
    }

    &--error {
      :deep(.base-input__input) {
        border-color: $color-status-error;
      }
    }
  }

  &__address-tags {
    margin-top: 12px;
  }

  &__address-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: $color-primary-50;
  }

  &__address-label-after {
    cursor: pointer;
    color: $color-primary-100;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  }

  &__required-mark {
    color: $color-status-error;
  }

  &__support-text {
    display: inline-block;
    color: $color-primary-50;
    font-weight: 500;
    margin-top: 6px;
  }

  &__valid-icon {
    width: 19px;
    height: 19px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: $color-spam-protection;
    color: $color-base-white-100;
  }

  &__loader {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    color: $color-spam-protection;
    background: linear-gradient(currentcolor 40%, transparent 70%);
    mask: radial-gradient(
      closest-side,
      transparent 70%,
      $color-spam-protection 70%
    );
    animation: rotate 0.5s linear infinite;
  }

  &__manual-address-container {
    opacity: 1;
    transition:
      opacity 0.5s ease-in-out,
      max-height 0.4s ease-in-out,
      transform 0.4s ease-in-out;
    border: 1px solid $color-base-black-20;
    padding: 16px;
    border-radius: 12px;
    margin-top: 12px;
    overflow: hidden;

    &--show {
      opacity: 1;
      max-height: 600px;
      transition-delay: 0.2s;
    }
  }

  :deep(.base-input__feedback) {
    grid-column: 1 / 5;
    width: 100%;
    display: block;
  }

  // Override BaseInput and BaseSelect disabled style due to lack of visibility
  :deep(.base-input__input:disabled) {
    @at-root .theme-dark & {
      border-color: $color-primary-10;
    }
  }

  :deep(.base-select__select:disabled) {
    @at-root .theme-dark & {
      border-color: $color-primary-10;
    }
  }
}

.tag-fade-enter-active,
.tag-fade-leave-active {
  transition: all 0.2s ease-in-out;
}

.tag-fade-enter-from,
.tag-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.tag-fade-enter-to,
.tag-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.text-fade-enter-active {
  transition: all 0.3s ease-in-out;
}

.text-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.text-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  margin-top: 0;
}

.text-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
}

.text-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 50px;
  margin-top: 4px;
}

.text-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
  margin-top: 0;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
