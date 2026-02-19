<script setup lang="ts">
import { computed, inject, ref, toValue, useTemplateRef } from "vue";
import { parsePhoneNumber } from "awesome-phonenumber";
import CheckoutParagraph from "@/features/subscribe/components/CheckoutParagraph.vue";
import CheckoutSignupForm from "@/features/checkout/CheckoutSignupForm.vue";
import CheckoutSignupVerification from "@/features/checkout/CheckoutSignupVerification.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import type { SignupCredentials } from "@/features/headless-signup/types.ts";
import { checkoutSessionInjectionKey } from "@/features/checkout/injectionKeys.ts";

type CheckoutCardAccountProps = {
  error: string | null;
};

defineProps<CheckoutCardAccountProps>();

const checkoutSession = inject(checkoutSessionInjectionKey);

const isDisabled = computed(
  () =>
    !checkoutSession?.user ||
    !!checkoutSession?.status ||
    !!checkoutSession?.isRegistered
);

const form = ref({
  type: "phone",
  phone: toValue(checkoutSession)?.phone ?? "",
  email: toValue(checkoutSession)?.email ?? "",
  username: "",
  password: "",
});

const signupForm = useTemplateRef("signupForm");
const signupVerification = useTemplateRef("signupVerification");

const getCredentials = (): SignupCredentials | null => {
  const { type, phone, email, username, password } = toValue(form);

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
  const isFormValid = !!signupForm.value?.validateForm();

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

  if (!signupVerification.value) {
    return false;
  }

  const hasVerifiedPhone = await signupVerification.value.verifyPhone();

  if (!hasVerifiedPhone) {
    return false;
  }

  return credentials;
};

defineExpose({ verifyForm });
</script>

<template>
  <BaseSheet
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    class="checkout-card-account"
  >
    <CheckoutTitle>Account details</CheckoutTitle>
    <CheckoutParagraph variant="body-3-regular">
      Use your phone number to create an account, or secure your account with a
      strong password.
    </CheckoutParagraph>
    <CheckoutSignupForm
      ref="signupForm"
      v-model:type="form.type"
      v-model:phone="form.phone"
      v-model:email="form.email"
      v-model:username="form.username"
      v-model:password="form.password"
      :is-disabled="isDisabled"
      class="checkout-card-account__form"
      :class="{ 'checkout-card-account__form--error': error }"
    />
    <CheckoutSignupVerification
      ref="signupVerification"
      :phone="form.phone"
    />
    <BaseInputFeedback
      v-if="error"
      variant="error"
      :message="error"
      class="checkout-card-account__error"
    />
  </BaseSheet>
</template>

<style scoped lang="scss">
.checkout-card-account {
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

    @at-root .checkout-card-account__form:has(.base-input-feedback--error) ~ & {
      display: none;
    }
  }
}
</style>
