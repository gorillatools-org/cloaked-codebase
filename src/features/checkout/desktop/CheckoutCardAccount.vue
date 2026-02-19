<script setup lang="ts">
import { useTemplateRef } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutParagraph from "@/features/subscribe/components/CheckoutParagraph.vue";
import CheckoutAccountCreation from "@/features/checkout/CheckoutAccountCreation.vue";

type CheckoutCardAccountProps = {
  error: string | null;
};

defineProps<CheckoutCardAccountProps>();

const contentRef = useTemplateRef("contentRef");

const verifyForm = () => contentRef.value?.verifyForm();

defineExpose({ verifyForm });
</script>

<template>
  <BaseSheet
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    rounding="sm"
    class="checkout-card-account"
  >
    <header class="checkout-card-account__header">
      <CheckoutTitle>Account details</CheckoutTitle>
      <slot name="header-right" />
    </header>
    <CheckoutParagraph
      variant="body-3-regular"
      class="checkout-card-account__text"
    >
      Use your phone number to create an account, or secure your account with a
      strong password.
    </CheckoutParagraph>
    <CheckoutAccountCreation
      ref="contentRef"
      :error="error"
    />
  </BaseSheet>
</template>

<style scoped lang="scss">
.checkout-card-account {
  border: none;
  background: $color-base-black-5;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__text {
    color: $color-base-black-60;
  }
}
</style>
