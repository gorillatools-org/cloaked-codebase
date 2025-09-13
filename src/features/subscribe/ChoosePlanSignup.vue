<script setup lang="ts">
import { computed, watch } from "vue";
import InputValidationError from "@/features/InputValidationError.vue";
import DataDeleteInputPassword from "@/features/data-delete/atoms/DataDeleteInputPassword.vue";
import DataDeleteInput from "@/features/data-delete/atoms/DataDeleteInput.vue";
import DataDeleteSelect from "@/features/data-delete/DataDeleteSelect.vue";
import ButtonPlans from "@/features/subscribe/ButtonPlans.vue";
import { usePhoneValidation } from "@/composables/validation/usePhoneValidation";
import { useEmailValidation } from "@/composables/validation/useEmailValidation";
import { useUsernameValidation } from "@/composables/validation/useUsernameValidation";
import { usePasswordValidation } from "@/composables/validation/usePasswordValidation";
import { useConfirmPasswordValidation } from "@/composables/validation/useConfirmPasswordValidation";
import { parsePhoneNumber } from "awesome-phonenumber";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutParagraph from "@/features/subscribe/components/CheckoutParagraph.vue";
import DataDeleteInputPhone from "@/features/data-delete/atoms/DataDeleteInputPhone.vue";
import BaseText from "@/library/BaseText.vue";
import store from "@/store";
import { templateRef } from "@vueuse/core";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_CHECKOUT_MINIMAL_COPY_MODE } from "@/scripts/posthogEvents";

type Identifier = "phone" | "email" | "username";

type ChoosePlanSignupProps = {
  identifiers?: Identifier[];
  isSubscribed?: boolean;
  isLoading?: boolean;
  signupError?: string | null;
};

const props = withDefaults(defineProps<ChoosePlanSignupProps>(), {
  identifiers: () => ["phone", "email", "username"],
  isSubscribed: false,
  isLoading: false,
  signupError: null,
});

const USERNAME_TYPE_TO_LABEL: Record<Identifier, string> = {
  phone: "Phone number",
  email: "Email address",
  username: "Username",
};

const emit = defineEmits(["submit"]);

const type = defineModel<string>("type", { default: "phone" });
const phone = defineModel<string | null>("phone", { default: null });
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

const validatePasswordAndConfirmPassword = () => {
  validatePassword();
  confirmPassword.value && validateConfirmPassword();
};

const validatePasswordAndConfirmPasswordDebounced = () => {
  validatePasswordDebounced();
  confirmPassword.value && validateConfirmPasswordDebounced();
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

const validateForm = () => {
  if (type.value === "phone") {
    validatePhone();
    email.value = null;
    username.value = null;
    password.value = null;
    confirmPassword.value = null;
  } else if (type.value === "email") {
    validateEmail();
    phone.value = null;
    username.value = null;
  } else {
    validateUsername();
    phone.value = null;
    email.value = null;
  }

  if (type.value !== "phone") {
    validatePassword();
    validateConfirmPassword();
  }
};

const isFormValid = computed(() => {
  if (type.value !== "phone") {
    return (
      !primaryIdentifierError.value &&
      !passwordError.value &&
      !confirmPasswordError.value &&
      ((username.value?.length ?? 0) > 0 || (email.value?.length ?? 0) > 0)
    );
  }

  return !primaryIdentifierError.value && (phone.value?.length ?? 0) > 0;
});

const toInternationalPhoneNumber = (phoneNumber: string | null) => {
  if (!phoneNumber) {
    return null;
  }

  const asInternationalNumber = parsePhoneNumber(phoneNumber);

  if (asInternationalNumber.valid) {
    return asInternationalNumber.number.e164;
  }

  const asUsaNumber = parsePhoneNumber(phoneNumber, { regionCode: "US" });

  if (asUsaNumber.valid) {
    return asUsaNumber.number.e164;
  }

  return null;
};

const onSubmit = () => {
  validateForm();

  if (isFormValid.value) {
    if (type.value === "phone") {
      const internationalPhone = toInternationalPhoneNumber(phone.value);
      phone.value = internationalPhone;
      emit("submit", {
        username: internationalPhone,
        phone: internationalPhone,
      });

      return;
    }

    if (type.value === "email") {
      emit("submit", {
        username: email.value,
        password: password.value,
        email: email.value,
      });

      return;
    }

    if (type.value === "username") {
      emit("submit", {
        username: username.value,
        password: password.value,
      });
    }
  }
};

const {
  featureFlag: checkoutMinimalModeEnabled,
  hasLoadedFeatureFlag: checkoutMinimalModeLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CHECKOUT_MINIMAL_COPY_MODE);

const isMinimalModeDisabled = computed(
  () =>
    checkoutMinimalModeLoaded.value && checkoutMinimalModeEnabled.value !== true
);

const form = templateRef("form");

const scrollIntoView = () => {
  form.value.scrollIntoView({ behavior: "smooth", block: "center" });
};

defineExpose({ onSubmit, scrollIntoView, isFormValid });

const user = computed(() => store.state.authentication.user);
const isRealUser = computed(
  () => !!user.value && user.value?.account_version >= 2
);

watch(
  () => props.signupError,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      scrollIntoView();
    }
  }
);
</script>

<template>
  <div class="choose-plan-signup">
    <CheckoutTitle>Create account</CheckoutTitle>
    <div v-if="isMinimalModeDisabled">
      <CheckoutParagraph v-if="type === 'phone' && !isRealUser">
        Use your phone number to create an account. It will also be your
        username to login.
      </CheckoutParagraph>
      <CheckoutParagraph v-else-if="!isRealUser">
        Secure your account with a strong password.
      </CheckoutParagraph>
    </div>
    <div
      id="choose-plan-signup-form"
      ref="form"
      class="choose-plan-signup__form"
      :class="{
        'choose-plan-signup__form--minimal-mode': !isMinimalModeDisabled,
      }"
    >
      <DataDeleteSelect
        v-model="type"
        variant="flat"
        :options="
          identifiers.map((identifier) => ({
            value: identifier,
            label: USERNAME_TYPE_TO_LABEL[identifier],
          }))
        "
        size-mobile="md"
        :disabled="isLoading"
        :error="!!primaryIdentifierError || !!props.signupError"
      >
        <BaseText variant="body-3-semibold">Register using</BaseText>
      </DataDeleteSelect>
      <DataDeleteInputPhone
        v-if="type === 'phone'"
        v-model="phone"
        variant="flat"
        placeholder="+12345678910"
        size-mobile="md"
        :disabled="isLoading"
        :error="!!phoneError || !!props.signupError"
        type="tel"
        autocomplete="tel"
        @blur="validatePhone"
        @input="validatePhoneDebounced"
      />
      <DataDeleteInput
        v-else-if="type === 'email'"
        v-model="email"
        variant="flat"
        placeholder="john@doe.com"
        size-mobile="md"
        :disabled="isLoading"
        :error="!!emailError || !!props.signupError"
        type="email"
        autocomplete="email"
        @blur="validateEmail"
        @input="validateEmailDebounced"
      />
      <DataDeleteInput
        v-else
        v-model="username"
        variant="flat"
        placeholder="john_doe"
        size-mobile="md"
        :disabled="isLoading"
        :error="!!usernameError || !!props.signupError"
        type="text"
        autocomplete="username"
        @blur="validateUsername"
        @input="validateUsernameDebounced"
      />
      <InputValidationError
        v-if="primaryIdentifierError || props.signupError"
        class="choose-plan-signup__primary-identifier-error"
        :class="{
          'choose-plan-signup__primary-identifier-error--phone':
            type === 'phone',
        }"
      >
        {{ primaryIdentifierError || props.signupError }}
      </InputValidationError>
      <template v-if="type !== 'phone'">
        <DataDeleteInputPassword
          v-model="password"
          variant="flat"
          placeholder="Set an account password"
          size-mobile="md"
          :disabled="isLoading"
          :error="!!passwordError"
          autocomplete="new-password"
          class="choose-plan-signup__password"
          @blur="validatePasswordAndConfirmPassword"
          @input="validatePasswordAndConfirmPasswordDebounced"
        >
          <BaseText variant="body-3-semibold">Password</BaseText>
          <template #after>
            <InputValidationError v-if="passwordError">
              {{ passwordError }}
            </InputValidationError>
          </template>
        </DataDeleteInputPassword>
        <DataDeleteInputPassword
          v-model="confirmPassword"
          variant="flat"
          placeholder="Confirm your password"
          size-mobile="md"
          :disabled="isLoading"
          :error="!!confirmPasswordError"
          autocomplete="new-password"
          class="choose-plan-signup__password"
          @blur="validateConfirmPassword"
          @input="validateConfirmPasswordDebounced"
        >
          <BaseText variant="body-3-semibold">Confirm password</BaseText>
          <template #after>
            <InputValidationError v-if="confirmPasswordError">
              {{ confirmPasswordError }}
            </InputValidationError>
          </template>
        </DataDeleteInputPassword>
      </template>
    </div>
    <div v-if="isMinimalModeDisabled">
      <CheckoutParagraph v-if="type === 'phone' && !phoneError && !isRealUser">
        U.S. and Canadian phone numbers accepted
      </CheckoutParagraph>
    </div>
    <CheckoutParagraph
      v-if="isRealUser"
      class="choose-plan-signup__success"
    >
      *Account created, please submit payment to continue
    </CheckoutParagraph>
    <slot name="before-cta" />
    <slot name="cta">
      <ButtonPlans
        class="choose-plan-signup__cta"
        :disabled="isLoading"
        :loading="isLoading"
        size="lg"
        full-width
        @click="onSubmit"
      >
        <template v-if="isLoading">Creating account</template>
        <template v-else>Finish creating your account</template>
      </ButtonPlans>
    </slot>
  </div>
</template>

<style scoped lang="scss">
.choose-plan-signup {
  &__form {
    display: grid;
    gap: 16px 12px;
    margin-top: 24px;
    margin-bottom: 8px;

    &:has(.choose-plan-signup__primary-identifier-error--phone) {
      margin-bottom: 0;
    }

    &--minimal-mode {
      margin-top: 16px;
    }

    @media all and (min-width: $screen-xl) {
      grid-template-columns: 1fr 1fr;
      align-items: end;
    }
  }

  &__success {
    color: $color-success;
  }

  &__primary-identifier-error {
    margin-top: -12px;

    @media all and (min-width: $screen-xl) {
      grid-column: 1/3;
    }

    &--phone {
      margin-top: -8px;
    }
  }

  :deep(.data-delete-input):has(&__password) {
    @media all and (min-width: $screen-xl) {
      grid-column: 1/3;
    }
  }

  &__cta {
    margin-top: 36px;
    width: 100%;

    &-icon {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
