<script setup lang="ts">
import { computed, inject, onBeforeMount, toValue, useTemplateRef } from "vue";
import { parsePhoneNumber } from "awesome-phonenumber";
import CheckoutSignupForm from "@/features/checkout/CheckoutSignupForm.vue";
import CheckoutSignupVerification from "@/features/checkout/CheckoutSignupVerification.vue";
import BaseText from "@/library/BaseText.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import {
  checkoutSessionInjectionKey,
  signupFormInjectionKey,
} from "@/features/checkout/injectionKeys.ts";
import type { SignupCredentials } from "@/features/headless-signup/types.ts";

type CheckoutAccountCreationProps = {
  error: string | null;
};

defineProps<CheckoutAccountCreationProps>();

const checkoutSession = inject(checkoutSessionInjectionKey);
const signupForm = inject(signupFormInjectionKey);

const isDisabled = computed(
  () => !!checkoutSession?.status || !!checkoutSession?.isRegistered
);

onBeforeMount(() => {
  const phone = toValue(checkoutSession)?.phone ?? "";
  const email = toValue(checkoutSession)?.email ?? "";

  if (signupForm && phone) {
    signupForm.value.phone = phone;
  }

  if (signupForm && email) {
    signupForm.value.email = email;
  }
});

const formComponent = useTemplateRef("formComponent");
const verificationComponent = useTemplateRef("verificationComponent");

const getCredentials = (): SignupCredentials | null => {
  if (!signupForm) {
    return null;
  }

  const { type, phone, email, username, password } = toValue(signupForm);

  if (type === "phone") {
    return {
      phone:
        parsePhoneNumber(phone, { regionCode: "US" })?.number?.e164 ?? phone,
    };
  }

  if (type === "email") {
    return {
      username: email,
      password: password,
      email: email,
    };
  }

  if (type === "username") {
    return {
      username: username,
      password: password,
    };
  }

  return null;
};

const verifyForm = async (): Promise<SignupCredentials | false> => {
  const isFormValid = !!formComponent.value?.validateForm();

  if (!isFormValid) {
    return false;
  }

  const credentials = getCredentials();

  if (!credentials) {
    return false;
  }

  if (!credentials.phone) {
    return credentials;
  }

  if (!verificationComponent.value) {
    return false;
  }

  const hasVerifiedPhone = await verificationComponent.value.verifyPhone();

  if (!hasVerifiedPhone) {
    return false;
  }

  return credentials;
};

defineExpose({ verifyForm });
</script>

<template>
  <div class="checkout-account-creation">
    <CheckoutSignupForm
      v-if="signupForm"
      ref="formComponent"
      v-model:type="signupForm.type"
      v-model:phone="signupForm.phone"
      v-model:email="signupForm.email"
      v-model:username="signupForm.username"
      v-model:password="signupForm.password"
      :is-disabled="isDisabled"
      class="checkout-account-creation__form"
      :class="{ 'checkout-account-creation__form--error': error }"
    />
    <CheckoutSignupVerification
      v-if="signupForm"
      ref="verificationComponent"
      :phone="signupForm.phone"
    />
    <BaseInputFeedback
      v-if="error"
      variant="error"
      :message="error"
      class="checkout-account-creation__error"
    />
    <BaseText
      v-if="!!checkoutSession?.isRegistered && !!checkoutSession?.isLoggedIn"
      variant="body-small-medium"
      class="checkout-account-creation__success"
      as="p"
    >
      *Account created, please submit payment to continue
    </BaseText>
  </div>
</template>

<style scoped lang="scss">
.checkout-account-creation {
  &__form {
    margin-top: 16px;

    &--error {
      :deep(.base-select__select),
      :deep(.base-input__input) {
        border-color: $color-alert;
      }
    }
  }

  &__error {
    display: block;
    margin-top: 16px;
  }

  &__success {
    margin-top: 16px;
    color: $color-success;
  }
}
</style>
