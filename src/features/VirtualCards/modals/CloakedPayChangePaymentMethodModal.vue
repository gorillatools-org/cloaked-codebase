<script setup lang="ts">
import { ref, useTemplateRef, watch } from "vue";
import type { Appearance } from "@stripe/stripe-js";
import StripePaymentModalContent from "@/features/modals/StripePaymentModalContent.vue";
import { getStripeModalAppearance } from "@/features/checkout/stripeAppearanceModal";
import { useStripeElements } from "@/features/checkout/useStripeElements";
import SubscriptionService from "@/api/settings/subscription-services";
import { useToast } from "@/composables/useToast.js";
import { useColorScheme } from "@/composables/useColorScheme";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "success", paymentMethodId: string): void;
}>();

const toast = useToast();
const { colorScheme } = useColorScheme();
const isSubmitting = ref(false);
const isLoading = ref(true);
const isStripeInitialized = ref(false);
const contentRef =
  useTemplateRef<InstanceType<typeof StripePaymentModalContent>>("contentRef");

const {
  loadStripe,
  loadStripeElements,
  useStripeAppearance,
  createPaymentElement,
  updatePaymentElement,
  confirmPaymentElement,
  unmountPaymentElement,
  paymentElement,
  stripeError,
} = useStripeElements();

useStripeAppearance(
  (options) => getStripeModalAppearance(options.scheme) as unknown as Appearance
);

const initializeStripe = async () => {
  isLoading.value = true;

  const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 800));

  try {
    if (!isStripeInitialized.value) {
      const setupIntent = await SubscriptionService.createSetupIntent();
      if (!setupIntent?.client_secret) {
        throw new Error("Failed to create setup intent");
      }

      await loadStripe();
      loadStripeElements(setupIntent);
      createPaymentElement();

      if (stripeError.value) {
        throw new Error(stripeError.value);
      }

      const mountEl = contentRef.value?.stripeElementRef;
      if (!mountEl || !paymentElement.value) {
        throw new Error("DOM element ref is null");
      }

      updatePaymentElement({ scheme: colorScheme.value });
      paymentElement.value.mount(mountEl);
      isStripeInitialized.value = true;
    }

    await minLoadingTime;
    isLoading.value = false;
  } catch (error) {
    console.error("Stripe initialization failed:", error);
    toast.error("Failed to load payment form. Please try again.");

    await minLoadingTime;
    isStripeInitialized.value = false;
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    const paymentMethodId = await confirmPaymentElement();

    if (stripeError.value || !paymentMethodId) {
      throw new Error(
        stripeError.value || "No payment method ID returned. Please try again."
      );
    }

    emit("success", paymentMethodId as string);
  } catch (error) {
    console.error("Payment method creation failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to add payment method. Please try again.";
    toast.error(message);
  } finally {
    isSubmitting.value = false;
  }
};

const handleClose = () => {
  isSubmitting.value = false;
  emit("close");
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      initializeStripe();
    } else {
      // Defer cleanup until after modal animation completes
      setTimeout(() => {
        unmountPaymentElement();
        isStripeInitialized.value = false;
      }, 500);
    }
  }
);

watch(
  () => colorScheme.value,
  () => {
    if (isStripeInitialized.value) {
      updatePaymentElement({ scheme: colorScheme.value });
    }
  }
);
</script>

<template>
  <StripePaymentModalContent
    ref="contentRef"
    :show="props.show"
    title="Update payment method"
    description="Enter a new card to update the payment method on your Cloaked subscription."
    medallion-icon="card-pos"
    medallion-color="safe-zone-blue"
    :is-loading="isLoading"
    :is-submitting="isSubmitting"
    button-text="Update payment method"
    button-text-loading="Updating..."
    @close="handleClose"
    @submit="handleSubmit"
  />
</template>
