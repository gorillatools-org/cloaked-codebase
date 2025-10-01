<script setup lang="ts">
import BaseSheet from "@/library/BaseSheet.vue";
import CheckoutTitle from "@/features/subscribe/components/CheckoutTitle.vue";
import CheckoutParagraph from "@/features/subscribe/components/CheckoutParagraph.vue";
import BaseInputFeedback from "@/library/BaseInputFeedback.vue";
import BaseText from "@/library/BaseText.vue";
import { computed, inject, useTemplateRef, ref, watch, nextTick } from "vue";
import { watchImmediate } from "@vueuse/core";
import { useColorScheme } from "@/composables/useColorScheme.ts";
import {
  checkoutSessionInjectionKey,
  stripeElementsInjectionKey,
} from "@/features/checkout/injectionKeys.ts";

type CheckoutCardPaymentProps = {
  error: string | null;
};

const props = defineProps<CheckoutCardPaymentProps>();

const emit = defineEmits<{
  "clear-error": [];
}>();

const stripeElements = inject(stripeElementsInjectionKey);
const checkoutSession = inject(checkoutSessionInjectionKey);

const stripeRef = useTemplateRef("stripeRef");

const { colorScheme } = useColorScheme();
const isAutoRetrying = ref<boolean>(false);

const isReady = computed(
  () => !!stripeElements?.paymentElement.value && !!stripeRef.value
);

const isReadOnly = computed(
  () =>
    !!checkoutSession?.status ||
    !!checkoutSession?.isPaid ||
    isAutoRetrying.value
);

// Automatically retry when error appears
watch(
  () => props.error,
  async (newError, oldError) => {
    // Only auto-retry if we just got a new error and we're not processing
    if (
      newError &&
      !oldError &&
      !checkoutSession?.status &&
      !isAutoRetrying.value
    ) {
      await handleAutoRetry();
    }
  }
);

const handleAutoRetry = async () => {
  if (!stripeElements?.refreshSetupIntent || !stripeRef.value) return;

  try {
    isAutoRetrying.value = true;

    // Small delay to show the error briefly before clearing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Refresh the setup intent
    const refreshed = await stripeElements.refreshSetupIntent();

    if (refreshed) {
      // Wait a tick for the payment element to be created
      await nextTick();

      // Remount the payment element with fresh setup intent
      stripeElements.mountPaymentElement(stripeRef, {
        scheme: colorScheme.value,
        readOnly: isReadOnly.value,
      });

      // Immediately update the payment element to force adoption of appearance/readOnly
      stripeElements.updatePaymentElement({
        scheme: colorScheme.value,
        readOnly: isReadOnly.value,
      });

      // Only clear error after successful refresh and remount
      emit("clear-error");
    }
  } finally {
    isAutoRetrying.value = false;
  }
};

const unwatch = watchImmediate(isReady, (isReady) => {
  if (isReady) {
    stripeElements?.mountPaymentElement(stripeRef, {
      scheme: colorScheme.value,
    });

    watchImmediate(colorScheme, () =>
      stripeElements?.updatePaymentElement({ scheme: colorScheme.value })
    );

    watchImmediate(isReadOnly, () => {
      stripeElements?.updatePaymentElement({ readOnly: isReadOnly.value });
    });

    unwatch();
  }
});
</script>

<template>
  <BaseSheet
    elevation="md"
    spacing-x="lg"
    spacing-y="lg"
    class="checkout-card-payment"
  >
    <CheckoutTitle>Payment details</CheckoutTitle>
    <CheckoutParagraph variant="body-3-regular">
      All transactions are secured and encrypted by
      <strong>Stripe.</strong>
    </CheckoutParagraph>
    <div
      ref="stripeRef"
      class="checkout-card-payment__form"
      :class="{ 'checkout-card-payment__form--loading': isAutoRetrying }"
    />
    <BaseInputFeedback
      v-if="error && !isAutoRetrying"
      variant="error"
      :message="error"
      class="checkout-card-payment__error"
    />
    <BaseText
      v-if="isAutoRetrying"
      variant="body-small-medium"
      class="checkout-card-payment__loading"
    >
      Refreshing payment form...
    </BaseText>
  </BaseSheet>
</template>

<style lang="scss" scoped>
.checkout-card-payment {
  &__form {
    margin-top: 16px;

    &--loading {
      opacity: 0.6;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
  }

  &__error {
    display: block;
    margin-top: 16px;
  }

  &__loading {
    display: block;
    margin-top: 16px;
    color: $color-base-black-60;
  }
}
</style>
