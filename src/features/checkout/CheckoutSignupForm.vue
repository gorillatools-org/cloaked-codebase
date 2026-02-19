<script setup lang="ts">
import { computed } from "vue";
import { parsePhoneNumber } from "awesome-phonenumber";
import BaseSelect from "@/library/BaseSelect.vue";
import BaseInput from "@/library/BaseInput.vue";
import { usePhoneValidation } from "@/composables/validation/usePhoneValidation.ts";
import { useEmailValidation } from "@/composables/validation/useEmailValidation.ts";
import { useUsernameValidation } from "@/composables/validation/useUsernameValidation.ts";
import { usePasswordValidation } from "@/composables/validation/usePasswordValidation.ts";
import { useConfirmPasswordValidation } from "@/composables/validation/useConfirmPasswordValidation.ts";

type Identifier = "phone" | "email" | "username";

defineProps<{
  isDisabled: boolean;
}>();

const type = defineModel<string>("type", { default: "phone" });

const phone = defineModel<string | null>("phone", {
  default: null,
  get(value) {
    if (!value) {
      return value;
    }

    const parsedPhoneNumber = parsePhoneNumber(value, { regionCode: "US" });
    const international = parsedPhoneNumber?.number?.international;
    const national = parsedPhoneNumber?.number?.national;

    if (
      ["US", "CA"].includes(parsedPhoneNumber?.regionCode ?? "") &&
      national?.length === 14
    ) {
      return `+1 ${national}`;
    }

    if (
      !["US", "CA"].includes(parsedPhoneNumber?.regionCode ?? "") &&
      international
    ) {
      return international;
    }

    return value;
  },
});

const email = defineModel<string | null>("email", { default: null });
const username = defineModel<string | null>("username", { default: null });
const password = defineModel<string | null>("password", { default: null });
const confirmPassword = defineModel<string | null>("confirmPassword", {
  default: null,
});

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

const {
  error: usernameError,
  validate: validateUsername,
  validateDebounced: validateUsernameDebounced,
} = useUsernameValidation(username);

const {
  error: passwordError,
  validate: validatePassword,
  validateDebounced: validatePasswordDebounced,
} = usePasswordValidation(password);

const {
  error: confirmPasswordError,
  validate: validateConfirmPassword,
  validateDebounced: validateConfirmPasswordDebounced,
} = useConfirmPasswordValidation(confirmPassword, {
  originalPassword: password,
});

const onFocusPhone = (event: FocusEvent) => {
  if (!phone.value?.trim()) {
    phone.value = "+1 ";

    const target = event.target as HTMLInputElement;

    setTimeout(() =>
      target.setSelectionRange(
        phone.value?.length ?? null,
        phone.value?.length ?? null
      )
    );
  }
};

const onBlurPhone = () => {
  if (phone.value?.trim() === "+1") {
    phone.value = "";
  }
};

const validatePasswordAndConfirmPassword = () => {
  validatePassword();
  confirmPassword.value && validateConfirmPassword();
};

const validatePasswordAndConfirmPasswordDebounced = () => {
  validatePasswordDebounced();
  confirmPassword.value && validateConfirmPasswordDebounced();
};

const isFormValid = computed(() => {
  if (type.value !== "phone") {
    return (
      !primaryIdentifierError.value &&
      !passwordError.value &&
      !confirmPasswordError.value
    );
  }

  return !primaryIdentifierError.value;
});

const validateForm = () => {
  if (type.value === "phone") {
    validatePhone();
  } else if (type.value === "email") {
    validateEmail();
  } else {
    validateUsername();
  }

  if (type.value !== "phone") {
    validatePassword();
    validateConfirmPassword();
  }

  return isFormValid.value;
};

const primaryIdentifierError = computed(() => {
  if (type.value === "phone") {
    return phoneError.value;
  } else if (type.value === "email") {
    return emailError.value;
  } else {
    return usernameError.value;
  }
});

const typeOptions = computed<{ value: Identifier; label: string }[]>(() => [
  { value: "phone", label: "Phone number" },
  { value: "email", label: "Email address" },
  { value: "username", label: "Username" },
]);

defineExpose({ validateForm });
</script>

<template>
  <div class="checkout-signup-form">
    <BaseSelect
      v-model="type"
      title="Register using"
      placeholder="Select a method"
      :options="typeOptions"
      :disabled="isDisabled"
      :error="''"
    />
    <BaseInput
      v-if="type === 'phone'"
      v-model="phone"
      title="Phone number"
      placeholder="+12345678910"
      :disabled="isDisabled"
      :error="phoneError"
      type="tel"
      autocomplete="tel"
      @focus="onFocusPhone"
      @blur="
        onBlurPhone();
        validatePhone();
      "
      @input="validatePhoneDebounced"
    />
    <BaseInput
      v-else-if="type === 'email'"
      v-model="email"
      title="Email"
      placeholder="john@doe.com"
      :disabled="isDisabled"
      :error="emailError"
      type="email"
      autocomplete="email"
      @blur="validateEmail"
      @input="validateEmailDebounced"
    />
    <BaseInput
      v-else
      v-model="username"
      title="Username"
      placeholder="john_doe"
      :disabled="isDisabled"
      :error="usernameError"
      type="text"
      autocomplete="username"
      @blur="validateUsername"
      @input="validateUsernameDebounced"
    />
    <template v-if="type !== 'phone'">
      <BaseInput
        v-model="password"
        secret
        title="Password"
        placeholder="Set an account password"
        :disabled="isDisabled"
        :error="passwordError"
        autocomplete="new-password"
        class="checkout-signup-form__password"
        @blur="validatePasswordAndConfirmPassword"
        @input="validatePasswordAndConfirmPasswordDebounced"
      />
      <BaseInput
        v-model="confirmPassword"
        secret
        title="Confirm Password"
        placeholder="Confirm your password"
        :disabled="isDisabled"
        :error="confirmPasswordError"
        autocomplete="new-password"
        class="checkout-signup-form__password"
        @blur="validateConfirmPassword"
        @input="validateConfirmPasswordDebounced"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.checkout-signup-form {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;

  @media all and (min-width: $screen-xl) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }

  :deep(.base-select__select),
  :deep(.base-input__input) {
    border-radius: 12px;
    height: 65px;
  }

  @media all and (min-width: $screen-xl) {
    &__password {
      grid-column: 1/3;
    }
  }
}
</style>
