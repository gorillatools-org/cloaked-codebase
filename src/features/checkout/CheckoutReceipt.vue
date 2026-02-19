<script setup lang="ts">
import { computed, inject, toRef } from "vue";
import { watchImmediate } from "@vueuse/core";
import { parsePhoneNumber } from "awesome-phonenumber";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import PersonalInfoServices from "@/api/settings/personal-services";
import { useSignupVerification } from "@/features/subscribe/composables/useSignupVerification";
import {
  checkoutSessionInjectionKey,
  headlessAuthInjectionKey,
  signupFormInjectionKey,
} from "@/features/checkout/injectionKeys.ts";

type CheckoutReceiptProps = {
  size?: "md" | "lg";
};

const props = withDefaults(defineProps<CheckoutReceiptProps>(), {
  size: "lg",
});

const isChecked = defineModel({ default: true, type: Boolean });

const checkoutSession = inject(checkoutSessionInjectionKey);
const headlessAuth = inject(headlessAuthInjectionKey);
const signupForm = inject(signupFormInjectionKey);

const { verifiedSearchPhone, verifiedSignupPhone } = useSignupVerification({
  form: signupForm,
  user: toRef(() => headlessAuth?.headlessUser.value),
});

const phone = computed(() => {
  if (signupForm?.value.type === "phone") {
    return (
      verifiedSignupPhone.value ??
      signupForm?.value?.phone ??
      verifiedSearchPhone.value ??
      null
    );
  }

  return verifiedSignupPhone.value ?? null;
});

const parsedPhone = computed(() =>
  phone.value
    ? (parsePhoneNumber(phone.value, { regionCode: "US" }) ?? null)
    : null
);

const textVariant = computed(() => {
  const variants = {
    md: "footnote-emphasized",
    lg: "body-3-semibold",
  };

  return variants[props.size];
});

watchImmediate(
  () => ({
    isChecked: isChecked.value,
    parsedPhone: parsedPhone.value,
  }),
  ({ isChecked, parsedPhone }) => {
    if (parsedPhone?.valid) {
      PersonalInfoServices.setReceiptNumber(
        // @ts-ignore
        isChecked ? parsedPhone.number.e164 : null
      );
    }
  }
);
</script>

<template>
  <BaseText
    v-if="parsedPhone?.valid"
    as="label"
    :variant="textVariant"
    :class="['checkout-receipt', `checkout-receipt--${size}`]"
  >
    <div class="checkout-receipt__icon">
      <BaseIcon name="check" />
    </div>
    <input
      v-model="isChecked"
      :disabled="!!checkoutSession?.status || !!checkoutSession?.isPaid"
      type="checkbox"
      class="checkout-receipt__input"
    />
    <span class="checkout-receipt__text">
      Text my receipt to {{ parsedPhone.number.national }}
    </span>
  </BaseText>
</template>

<style scoped lang="scss">
.checkout-receipt {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }

  &:has(.checkout-receipt__input:disabled) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__icon {
    width: 18px;
    height: 18px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 1px solid $color-base-black-60;

    & > * {
      display: none;
      color: $color-base-white-100;
    }

    @at-root .checkout-receipt:has(.checkout-receipt__input:checked) & {
      background-color: $color-base-black-100;
      border: 1px solid $color-base-black-100;

      & > * {
        display: block;
      }
    }
  }

  &__text {
    color: $color-base-black-60;
    margin-top: 2px;

    @at-root .checkout-receipt:has(.checkout-receipt__input:checked) & {
      color: $color-base-black-80;
    }
  }

  &__input {
    display: none;
  }

  &--md {
    gap: 6px;

    .checkout-receipt__icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
    }
  }
}
</style>
