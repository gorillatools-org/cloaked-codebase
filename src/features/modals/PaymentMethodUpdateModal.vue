<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useStripeIntent } from "@/features/subscribe/composables/useStripeIntent.js";
import StripePaymentModalContent from "@/features/modals/StripePaymentModalContent.vue";
import { getStripeModalAppearance } from "@/features/checkout/stripeAppearanceModal";
import SubscriptionService from "@/api/settings/subscription-services";
import { posthogCapture } from "@/scripts/posthog";
import { useToast } from "@/composables/useToast.js";
import type { SetupIntent } from "@/features/subscribe/types";
import store from "@/store";
import { useColorScheme } from "@/composables/useColorScheme";
import { generateConsistentFakeName } from "@/utils/generateFakeName";

interface Props {
  show: boolean;
  context?: "billing" | "collections";
  source?: "banner" | "settings";
}

interface Emits {
  (e: "close"): void;
  (e: "success"): void;
  (e: "reactivation-success"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const toast = useToast();
const { colorScheme } = useColorScheme();
const isSubmitting = ref(false);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const setupIntent = ref<SetupIntent | null>(null);
const paymentIntent = ref<any>(null);
const isStripeInitialized = ref(false);
const frozenModalContent = ref<any>(null);
const contentRef = ref<InstanceType<typeof StripePaymentModalContent> | null>(
  null
);

// Account state detection
const currentSubscription = computed(
  () => store.getters["settings/getSubscription"]
);
const isCanceledAccount = computed(
  () => currentSubscription.value?.state === "CANCELED"
);

// Flow type determination
const flowType = computed(() => {
  if (props.context === "collections") {
    return isCanceledAccount.value ? "subscription_creation" : "payment_retry";
  }
  return "payment_update";
});

// Plan reconstruction for CANCELED accounts
const reconstructedPlan = computed(() => {
  if (
    !isCanceledAccount.value ||
    !currentSubscription.value?.product_identifier
  ) {
    return null;
  }

  return {
    product_id: currentSubscription.value.product_identifier,
    type: "individual", // Default type
    provider: "stripe",
  };
});

// Stripe composables for subscription flow
const { getIntent } = useStripeIntent();

// Get pricing information for reactivation
const pricingInfo = computed(() => {
  if (!currentSubscription.value) return null;

  const price = currentSubscription.value.product_price;
  const planTitle = currentSubscription.value.product_plan_title || "Cloaked";
  const interval = currentSubscription.value.recurring_interval;

  if (!price) return null;

  const formattedPrice = (price / 100).toFixed(2);
  const intervalText = interval === "year" ? "year" : "month";

  return {
    planTitle,
    price: formattedPrice,
    interval: intervalText,
  };
});

// Context-aware modal content (unfrozen)
const computedModalContent = computed(() => {
  if (props.context === "collections") {
    let description =
      "Update your payment method to reactivate your Cloaked account and restore access to all services.";

    if (pricingInfo.value) {
      description = `You will be charged $${pricingInfo.value.price}/${pricingInfo.value.interval} for your ${pricingInfo.value.planTitle} plan. Update your payment method to reactivate your account and restore full access.`;
    }

    return {
      title: "Reactivate Your Account",
      description,
      buttonText: "Reactivate Account",
      buttonTextLoading: "Reactivating...",
      medallionIcon: "exclamation-mark-triangle" as const,
      medallionColor: "error" as const,
      variant: "primary" as const,
      successMessage: "Account reactivated successfully!",
      dangerDescription: true,
    };
  }

  // Default billing context (maintains existing behavior)
  return {
    title: "Change Payment Method",
    description: "Add a new payment method for your subscription billing.",
    buttonText: "Change Payment",
    buttonTextLoading: "Changing...",
    medallionIcon: "card-pos" as const,
    medallionColor: "safe-zone-blue" as const,
    variant: "primary" as const,
    successMessage: "Payment method updated successfully!",
    dangerDescription: false,
  };
});

// Use frozen content to prevent UI updates during close animation
const modalContent = computed(() => {
  return frozenModalContent.value || computedModalContent.value;
});

// Analytics context
const analyticsContext = computed(() => props.context || "billing");

// Store references to stripe instances for custom confirmation
let customStripe: any = null;
let customStripeElements: any = null;

// Custom stripe elements setup that can handle both intents
const setupCustomStripeElements = async (intent: any) => {
  if (!intent || !intent.client_secret) {
    throw new Error("Invalid payment intent provided");
  }

  // Load Stripe library
  const { loadStripe: loadStripeLibrary } = (
    await import("@/features/checkout/useStripe.ts")
  ).useStripe();
  customStripe = await loadStripeLibrary();

  if (!customStripe) {
    throw new Error(
      "Failed to load Stripe - please refresh the page and try again"
    );
  }

  try {
    customStripeElements = customStripe.elements({
      clientSecret: intent.client_secret,
    });

    const paymentElement = customStripeElements.create("payment", {
      layout: "tabs",
      paymentMethodOrder: ["card", "apple_pay", "google_pay"],
      terms: {
        card: "never",
      },
    });

    return paymentElement;
  } catch (error) {
    console.error("Error creating Stripe elements:", error);
    throw error;
  }
};

// Custom confirmation that handles both payment and setup intents
const confirmCustomStripeElement = async () => {
  if (!customStripe || !customStripeElements) {
    throw new Error("Stripe not initialized");
  }

  const stripeEmail = store.getters["settings/getStripe"]?.email;
  const fakeName = generateConsistentFakeName(stripeEmail);

  if (flowType.value === "subscription_creation" && paymentIntent.value) {
    // For subscription creation, use confirmPayment with payment intent
    const result = await customStripe.confirmPayment({
      elements: customStripeElements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: fakeName,
          },
        },
      },
      redirect: "if_required",
    });

    if (result.error) {
      throw new Error("Could not process payment. Please try again.");
    }
  } else {
    // For payment method updates/retry, use confirmSetup with setup intent
    const result = await customStripe.confirmSetup({
      elements: customStripeElements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: fakeName,
          },
        },
      },
      redirect: "if_required",
    });

    if (result.error) {
      throw new Error("Could not process payment. Please try again.");
    }
  }
};

const createSetupIntentForUpdate = async () => {
  try {
    const intent = await SubscriptionService.getTierSetupIntent(true);
    setupIntent.value = intent;
    return intent;
  } catch (error) {
    console.error("Failed to create setup intent:", error);
    throw new Error("Failed to initialize payment form");
  }
};

const createPaymentIntentForSubscription = async () => {
  try {
    if (!reconstructedPlan.value?.product_id) {
      throw new Error("No product ID available for subscription creation");
    }

    const intent = await getIntent(reconstructedPlan.value.product_id);
    paymentIntent.value = intent;
    return intent;
  } catch (error) {
    console.error("Failed to create payment intent:", error);
    throw new Error("Failed to initialize subscription form");
  }
};

const initializeStripe = async () => {
  isLoading.value = true;
  errorMessage.value = null;

  const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 800));

  try {
    if (!isStripeInitialized.value) {
      // Create the appropriate intent based on flow type
      let intent;
      if (flowType.value === "subscription_creation") {
        await createPaymentIntentForSubscription();
        intent = paymentIntent.value;
      } else {
        await createSetupIntentForUpdate();
        intent = setupIntent.value;
      }

      if (!intent) {
        throw new Error("Failed to create intent");
      }

      // Set up custom Stripe elements with the intent
      const paymentElement = await setupCustomStripeElements(intent);

      // Apply theme-aware appearance
      customStripeElements.update({
        appearance: getStripeModalAppearance(colorScheme.value),
      });

      await new Promise((resolve) => setTimeout(resolve, 200));
      const mountEl = contentRef.value?.stripeElementRef;
      if (mountEl) {
        paymentElement.mount(mountEl);
      } else {
        throw new Error("DOM element ref is null");
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      isStripeInitialized.value = true;
    }

    await minLoadingTime;
    setTimeout(() => {
      isLoading.value = false;
    }, 100);
  } catch (error) {
    console.error("Stripe initialization failed:", error);
    errorMessage.value = "Failed to load payment form. Please try again.";

    await minLoadingTime;
    isStripeInitialized.value = false;
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    errorMessage.value = null;

    posthogCapture("payment_method_modal_submitted", {
      context: analyticsContext.value,
      user_state:
        analyticsContext.value === "collections" ? "expired" : "active",
      modal_variant: modalContent.value.variant,
      flow_type: flowType.value,
    });

    await confirmCustomStripeElement();

    if (flowType.value === "subscription_creation") {
      await store.dispatch("subscription/awaitSubscriptionChange");

      posthogCapture("payment_method_modal_success", {
        context: analyticsContext.value,
        flow_type: flowType.value,
      });

      toast.success("Account reactivated successfully!");

      if (props.context === "collections" && props.source === "settings") {
        emit("reactivation-success");
      }

      emit("success");

      // Brief delay to show success message, then close smoothly
      setTimeout(() => {
        emit("close");
      }, 300);
    } else if (flowType.value === "payment_retry") {
      // Wait for payment method to be processed
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await SubscriptionService.payNow();
      await store.dispatch("subscription/awaitSubscriptionChange");

      posthogCapture("payment_method_modal_success", {
        context: analyticsContext.value,
        flow_type: flowType.value,
      });

      toast.success("Account reactivated successfully!");

      if (props.context === "collections" && props.source === "settings") {
        emit("reactivation-success");
      }

      emit("success");

      // Brief delay to show success message, then close smoothly
      setTimeout(() => {
        emit("close");
      }, 300);
    } else {
      posthogCapture("payment_method_modal_success", {
        context: analyticsContext.value,
        flow_type: flowType.value,
      });

      toast.success(modalContent.value.successMessage);

      if (props.context === "collections" && props.source === "settings") {
        emit("reactivation-success");
      }

      emit("success");

      // Brief delay to show success message, then close smoothly
      setTimeout(() => {
        emit("close");
      }, 300);
    }

    // Reset state - minimal cleanup after success, full cleanup happens when modal closes
    errorMessage.value = null;
    isStripeInitialized.value = false;
  } catch (error) {
    console.error("Payment submission failed:", error);
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Failed to process payment. Please try again.";

    toast.error(errorMessage.value);

    posthogCapture("payment_method_modal_failed", {
      context: analyticsContext.value,
      error: errorMessage.value,
      flow_type: flowType.value,
    });
  } finally {
    isSubmitting.value = false;
  }
};

const handleClose = () => {
  isSubmitting.value = false;

  posthogCapture("payment_method_modal_cancelled", {
    context: analyticsContext.value,
    flow_type: flowType.value,
  });

  emit("close");

  // Defer cleanup until after modal animation completes
  setTimeout(() => {
    errorMessage.value = null;
    setupIntent.value = null;
    paymentIntent.value = null;

    // Clean up custom Stripe elements
    if (customStripeElements) {
      try {
        const elements = customStripeElements.getElement("payment");
        if (elements) {
          elements.unmount();
        }
      } catch {
        // Element may not be mounted
      }
      customStripe = null;
      customStripeElements = null;
    }

    isStripeInitialized.value = false;
  }, 500);
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      // Freeze modal content at open time to prevent updates during close animation
      frozenModalContent.value = { ...computedModalContent.value };

      // Enhanced analytics with user state context
      const userState =
        analyticsContext.value === "collections" ? "expired" : "active";
      const user = store.getters["authentication/user"];

      posthogCapture("payment_method_modal_opened", {
        context: analyticsContext.value,
        user_state: userState,
        has_outstanding_balance: user?.outstanding_balance > 0,
        is_cancelled: store.getters["settings/isCancelled"],
        modal_variant: modalContent.value.variant,
      });

      initializeStripe();
    } else {
      // Clear frozen content after modal is fully closed
      setTimeout(() => {
        frozenModalContent.value = null;
      }, 500);
    }
  }
);

// Watch for theme changes and update Stripe appearance
watch(
  () => colorScheme.value,
  () => {
    if (isStripeInitialized.value && customStripeElements) {
      customStripeElements.update({
        appearance: getStripeModalAppearance(colorScheme.value),
      });
    }
  }
);
</script>

<template>
  <StripePaymentModalContent
    ref="contentRef"
    :show="props.show"
    :title="modalContent.title"
    :description="modalContent.description"
    :medallion-icon="modalContent.medallionIcon"
    :medallion-color="modalContent.medallionColor"
    :is-loading="isLoading"
    :is-submitting="isSubmitting"
    :button-text="modalContent.buttonText"
    :button-text-loading="modalContent.buttonTextLoading"
    :button-variant="modalContent.variant"
    :danger-description="modalContent.dangerDescription"
    @close="handleClose"
    @submit="handleSubmit"
  />
</template>
