<script setup lang="ts">
import { ref, watch, onUnmounted, shallowRef, computed } from "vue";
import { useStripeIntent } from "@/features/subscribe/composables/useStripeIntent.js";
import BaseButton from "@/library/BaseButton.vue";
import BaseText from "@/library/BaseText.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
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
      buttonText: isSubmitting.value ? "Reactivating..." : "Reactivate Account",
      medallionIcon: "exclamation-mark-triangle" as const,
      medallionColor: "error" as const,
      variant: "primary" as const, // Use primary instead of danger for BaseButton
      successMessage: "Account reactivated successfully!",
    };
  }

  // Default billing context (maintains existing behavior)
  return {
    title: "Change Payment Method",
    description: "Add a new payment method for your subscription billing.",
    buttonText: isSubmitting.value ? "Changing..." : "Change Payment",
    medallionIcon: "card-pos" as const,
    medallionColor: "safe-zone-blue" as const, // Default color
    variant: "primary" as const,
    successMessage: "Payment method updated successfully!",
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

const getStripeAppearance = () => {
  const isDark = colorScheme.value === "dark";

  return {
    theme: "none" as const,
    labels: "above" as const,
    disableAnimations: true,
    variables: {
      colorDanger: "#F24141",
      fontFamily: "Urbanist, system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "12px",
      gridColumnSpacing: "8px",
      tabSpacing: "4px",
      gridRowSpacing: "8px",
      fontSmooth: "always",
    },
    rules: {
      ".Label": {
        fontSize: "13px",
        fontWeight: "500",
        color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(140, 142, 145, 1)",
      },
      ".Input": {
        padding: "23px 16px",
        fontSize: "15px",
        fontWeight: "600",
        transition: "none",
        backgroundColor: isDark
          ? "rgba(30, 30, 30, 1)"
          : "rgba(250, 250, 250, 1)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(0, 0, 0, 0.2)",
        color: isDark ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)",
        boxShadow: isDark
          ? "0 5px 20px 0 rgba(0, 0, 0, 0.3)"
          : "0 5px 20px 0 rgba(0, 0, 0, 0.05)",
      },
      ".Input::placeholder": {
        fontWeight: "600",
        fontSize: "15px",
        color: isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(209, 210, 211, 1)",
      },
      ".Input:hover": {
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.4)"
          : "1px solid rgba(0, 0, 0, 0.4)",
      },
      ".Input:focus": {
        border: isDark
          ? "1px solid rgba(255, 255, 255, 1)"
          : "1px solid rgba(0, 0, 0, 1)",
        boxShadow: isDark
          ? "0 10px 24px 0 rgba(0, 0, 0, 0.4)"
          : "0 10px 24px 0 rgba(0, 0, 0, 0.15)",
      },
      ".Tab": {
        fontSize: "13px",
        fontWeight: "600",
        padding: "14px 16px",
        transition: "none",
        backgroundColor: isDark
          ? "rgba(30, 30, 30, 1)"
          : "rgba(250, 250, 250, 1)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : "1px solid rgba(0, 0, 0, 0.2)",
        color: isDark ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)",
        boxShadow: isDark
          ? "0 5px 20px 0 rgba(0, 0, 0, 0.3)"
          : "0 5px 20px 0 rgba(0, 0, 0, 0.05)",
      },
      ".Tab:hover": {
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.4)"
          : "1px solid rgba(0, 0, 0, 0.4)",
      },
      ".Tab:focus": {
        border: isDark
          ? "1px solid rgba(255, 255, 255, 1)"
          : "1px solid rgba(0, 0, 0, 1)",
        boxShadow: isDark
          ? "0 5px 20px 0 rgba(0, 0, 0, 0.3)"
          : "0 5px 20px 0 rgba(0, 0, 0, 0.05)",
      },
      ".Tab--selected": {
        backgroundColor: isDark
          ? "rgba(30, 30, 30, 1)"
          : "rgba(250, 250, 250, 1)",
        border: isDark
          ? "1px solid rgba(255, 255, 255, 1)"
          : "1px solid rgba(0, 0, 0, 1)",
        boxShadow: isDark
          ? "0 5px 20px 0 rgba(0, 0, 0, 0.3)"
          : "0 5px 20px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  };
};

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
      fonts: [
        {
          cssSrc:
            "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600&display=swap",
        },
      ],
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

const stripeElementRef = shallowRef<HTMLDivElement | null>(null);

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
        appearance: getStripeAppearance(),
      });

      await new Promise((resolve) => setTimeout(resolve, 200));
      if (stripeElementRef.value) {
        paymentElement.mount(stripeElementRef.value);
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

const handleKeydown = (event: KeyboardEvent) => {
  if (
    event.key === "Enter" &&
    props.show &&
    !isSubmitting.value &&
    !isLoading.value
  ) {
    event.preventDefault();
    handleSubmit();
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
      document.addEventListener("keydown", handleKeydown);
    } else {
      document.removeEventListener("keydown", handleKeydown);
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
      // Update Stripe appearance when theme changes
      customStripeElements.update({
        appearance: getStripeAppearance(),
      });
    }
  }
);

const onAfterEnter = () => {
  // Animation complete
};

const onAfterLeave = () => {
  // Cleanup after animation
};

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <transition
      name="payment-modal"
      :duration="{ enter: 400, leave: 400 }"
      @after-enter="onAfterEnter"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="props.show"
        class="payment-method-modal"
        :class="{
          'payment-method-modal--collections': props.context === 'collections',
        }"
      >
        <!-- Backdrop -->
        <div
          class="payment-method-modal__backdrop"
          @click="handleClose"
        />

        <!-- Sheet Content -->
        <div class="payment-method-modal__sheet">
          <!-- Scrollable Content -->
          <div class="payment-method-modal__content">
            <!-- Header -->
            <div class="payment-method-modal__header">
              <div class="payment-method-modal__header-top">
                <BaseMedallion
                  class="payment-method-modal__medallion"
                  :icon="modalContent.medallionIcon"
                  :color="modalContent.medallionColor"
                />

                <button
                  class="payment-method-modal__close-button"
                  aria-label="Close"
                  @click="handleClose"
                >
                  <svg
                    class="payment-method-modal__close-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <BaseText
                variant="headline-2-semibold"
                as="h2"
                class="payment-method-modal__title"
              >
                {{ modalContent.title }}
              </BaseText>

              <BaseText
                variant="body-small-medium"
                as="div"
                class="payment-method-modal__description"
              >
                {{ modalContent.description }}
              </BaseText>
            </div>

            <!-- Form -->
            <div class="payment-method-modal__form-container">
              <div
                v-show="isLoading"
                class="payment-method-modal__loading-state"
              >
                <div class="payment-method-modal__spinner" />
              </div>

              <div
                ref="stripeElementRef"
                class="payment-method-modal__stripe-element"
                :class="{
                  'payment-method-modal__stripe-element--hidden': isLoading,
                }"
              />
            </div>

            <!-- Actions -->
            <div class="payment-method-modal__actions">
              <BaseButton
                :variant="modalContent.variant"
                size="lg"
                full-width
                :loading="isSubmitting"
                :disabled="isSubmitting || isLoading"
                @click="handleSubmit"
              >
                {{ modalContent.buttonText }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.payment-method-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (width >= 768px) {
    align-items: center;
  }

  &__backdrop {
    position: absolute;
    inset: 0;
    background-color: rgb(0 0 0 / 50%);
    backdrop-filter: blur(4px);
    transition:
      opacity 0.2s ease,
      backdrop-filter 0.2s ease;
  }

  &__sheet {
    position: relative;
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 50vh;
    max-height: 90vh;
    background: var(--color-primary-1);
    border: 1px solid var(--color-primary-10);
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 24px rgb(0 0 0 / 15%);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @media (width >= 768px) {
      max-width: 540px;
      height: auto;
      min-height: auto;
      max-height: 90vh;
      border-radius: 20px;
    }
  }

  &__content {
    flex: 1;
    overflow: hidden auto;
    padding: 24px;
    -webkit-overflow-scrolling: touch;
  }

  &__header {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 12px;
  }

  &__header-top {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__medallion {
    flex-shrink: 0;
  }

  &__close-button {
    width: 36px;
    height: 36px;
    margin-top: 6px;
    border: none;
    background-color: $color-primary-10;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: $color-primary-70;
    transition: all 0.2s ease;
    flex-shrink: 0;
    padding: 0;

    &:hover {
      background-color: $color-primary-10;
      color: $color-primary-100;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__close-icon {
    width: 18px;
    height: 18px;
  }

  &__title {
    margin: 0;
    color: $color-primary-100;
  }

  &__description {
    color: $color-primary-50;
    line-height: 1.5;
  }

  &--collections {
    .payment-method-modal__description {
      color: $color-alert;
    }
  }

  &__form-container {
    position: relative;
    margin-bottom: 24px;
    border: 1px solid $color-primary-20;
    border-radius: 12px;
    background-color: $color-base-white-100;
    min-height: 80px;
  }

  &__loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background-color: $color-base-white-100;
    border-radius: 12px;
  }

  &__stripe-element {
    min-height: 120px;
    padding: 16px;
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;

    &--hidden {
      opacity: 0;
      transform: translateY(8px);
      pointer-events: none;
      position: absolute;
      inset: 0;
      z-index: -1;
    }

    /* stylelint-disable-next-line selector-class-pattern */
    :deep(.p-Element) {
      padding: 0;
    }
  }

  &__spinner {
    width: 24px;
    height: 24px;
    border: 2px solid $color-primary-10;
    border-top: 2px solid $color-primary-100;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__actions {
    display: flex;
    justify-content: center;
  }
}

.payment-modal-enter-active {
  .payment-method-modal__backdrop {
    transition:
      opacity 0.2s ease,
      backdrop-filter 0.2s ease;
  }

  .payment-method-modal__sheet {
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;

    @media (width >= 768px) {
      transition:
        transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.05s,
        opacity 0.35s ease 0.05s;
    }
  }
}

.payment-modal-leave-active {
  .payment-method-modal__backdrop {
    transition:
      opacity 0.25s ease 0.1s,
      backdrop-filter 0.25s ease 0.1s;
  }

  .payment-method-modal__sheet {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @media (width >= 768px) {
      transition:
        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.3s ease;
    }
  }
}

.payment-modal-enter-from {
  .payment-method-modal__backdrop {
    opacity: 0;
    backdrop-filter: blur(0);
  }

  .payment-method-modal__sheet {
    transform: translateY(100%);

    @media (width >= 768px) {
      transform: translateY(20px) scale(0.95);
      opacity: 0;
    }
  }
}

.payment-modal-leave-to {
  .payment-method-modal__backdrop {
    opacity: 0;
    backdrop-filter: blur(0);
  }

  .payment-method-modal__sheet {
    transform: translateY(100%);

    @media (width >= 768px) {
      transform: translateY(20px) scale(0.95);
      opacity: 0;
    }
  }
}

.payment-modal-enter-to,
.payment-modal-leave-from {
  .payment-method-modal__backdrop {
    opacity: 1;
    backdrop-filter: blur(4px);
  }

  .payment-method-modal__sheet {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
