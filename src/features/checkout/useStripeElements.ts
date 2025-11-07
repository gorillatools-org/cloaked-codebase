import { ref, toValue, type TemplateRef, type MaybeRefOrGetter } from "vue";
import { useStripe } from "@/features/checkout/useStripe.ts";
import {
  getStripeAppearance,
  type StripeAppearanceOptions,
} from "@/features/checkout/useStripeAppearance.ts";
import type { SetupIntent } from "@/features/subscribe/types.ts";
import {
  type Stripe,
  type StripeElements,
  type StripePaymentElement,
} from "@stripe/stripe-js";
import SubscriptionService from "@/api/settings/subscription-services";
import { generateConsistentFakeName } from "@/utils/generateFakeName";
import store from "@/store";

export const useStripeElements = () => {
  const { loadStripe: loadStripeLibrary } = useStripe();

  const stripeAppearance = ref<StripeAppearanceOptions>({
    scheme: "light",
    readOnly: false,
    error: false,
  });

  const stripe = ref<Stripe | null>(null);
  const stripeElements = ref<StripeElements | null>(null);
  const paymentElement = ref<StripePaymentElement | null>(null);
  const stripeError = ref<string | null>(null);
  const currentSetupIntent = ref<SetupIntent | null>(null);
  const isRefreshingIntent = ref<boolean>(false);

  const loadStripe = async () => {
    try {
      stripe.value = await loadStripeLibrary();
    } catch {
      stripeError.value = "Failed to load stripe.";
    }
  };

  const loadStripeElements = (intent: MaybeRefOrGetter<SetupIntent | null>) => {
    const stripeValue = toValue(stripe);
    const intentValue = toValue(intent);

    if (!stripeValue || !intentValue) {
      stripeError.value = "Failed to load stripe elements.";
      return;
    }

    // Store current setup intent for refresh capabilities
    currentSetupIntent.value = intentValue;

    stripeElements.value = stripeValue.elements({
      fonts: [
        {
          cssSrc:
            "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600&display=swap",
        },
      ],
      clientSecret: intentValue.client_secret,
    });
  };

  const createPaymentElement = () => {
    const stripeElementsValue = toValue(stripeElements);

    if (!stripeElementsValue) {
      stripeError.value = "Failed to create payment element.";
      return;
    }

    paymentElement.value = stripeElementsValue.create("payment", {
      layout: "tabs",
      paymentMethodOrder: ["card", "apple_pay", "google_pay"],
      terms: {
        card: "never",
      },
    });
  };

  const mountPaymentElement = (
    element: TemplateRef<HTMLDivElement>,
    options: Partial<StripeAppearanceOptions>
  ) => {
    const elementValue = toValue(element);
    const paymentElementValue = toValue(paymentElement);

    if (!paymentElementValue || !elementValue) {
      stripeError.value = "Failed to mount payment element.";
      return;
    }

    updatePaymentElement(options);
    paymentElementValue.mount(elementValue);
  };

  const updatePaymentElement = (options: Partial<StripeAppearanceOptions>) => {
    const stripeElementsValue = toValue(stripeElements);
    const paymentElementValue = toValue(paymentElement);

    if (!stripeElementsValue || !paymentElementValue) {
      stripeError.value = "Failed to update payment element.";
      return;
    }

    const appearance = { ...stripeAppearance.value, ...options };

    stripeElementsValue.update({ appearance: getStripeAppearance(appearance) });
    paymentElementValue.update({ readOnly: appearance.readOnly });

    stripeAppearance.value = appearance;
  };

  const confirmPaymentElement = async () => {
    const stripeValue = toValue(stripe);
    const stripeElementsValue = toValue(stripeElements);

    if (!stripeValue || !stripeElementsValue) {
      stripeError.value = "Failed to confirm payment.";
      return;
    }

    stripeError.value = null;

    const stripeEmail = store.getters["settings/getStripe"]?.email;
    const fakeName = generateConsistentFakeName(stripeEmail);

    const result = await stripeValue.confirmSetup({
      elements: stripeElementsValue,
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
      stripeError.value = "Could not process payment.";
      return;
    }
  };

  const refreshSetupIntent = async (): Promise<boolean> => {
    try {
      isRefreshingIntent.value = true;
      stripeError.value = null;

      // Check if stripe instance is available before proceeding
      if (!stripe.value) {
        stripeError.value = "Stripe is not initialized.";
        return false;
      }

      // Explicitly teardown existing payment element to prevent memory leaks
      teardownPaymentElement();

      // Create a fresh setup intent with force refresh
      const freshIntent = await SubscriptionService.getTierSetupIntent(true);

      // Null-check freshIntent before using it
      if (!freshIntent) {
        stripeError.value = "Failed to create fresh setup intent.";
        return false;
      }

      // Safely reload stripe elements with the fresh intent
      try {
        loadStripeElements(freshIntent);
      } catch {
        stripeError.value = "Failed to load stripe elements.";
        return false;
      }

      // Check if stripeElements was successfully created
      if (!stripeElements.value) {
        stripeError.value = "Failed to initialize stripe elements.";
        return false;
      }

      // Safely create payment element
      try {
        createPaymentElement();
      } catch {
        stripeError.value = "Failed to create payment element.";
        return false;
      }

      // Final check that payment element was created successfully
      if (!paymentElement.value) {
        stripeError.value = "Failed to create payment element.";
        return false;
      }

      return true;
    } catch {
      stripeError.value = "Failed to refresh payment setup. Please try again.";
      return false;
    } finally {
      isRefreshingIntent.value = false;
    }
  };

  const teardownPaymentElement = () => {
    // Safely unmount and destroy existing payment element to prevent memory leaks
    if (paymentElement.value) {
      try {
        paymentElement.value.unmount();
      } catch {
        // Ignore unmount errors (element might not be mounted)
      }
      paymentElement.value.destroy();
      paymentElement.value = null;
    }
  };

  const clearSetupIntent = () => {
    teardownPaymentElement();
    currentSetupIntent.value = null;
    stripeElements.value = null;
    stripeError.value = null;
  };

  return {
    loadStripe,
    loadStripeElements,
    createPaymentElement,
    mountPaymentElement,
    updatePaymentElement,
    confirmPaymentElement,
    refreshSetupIntent,
    teardownPaymentElement,
    clearSetupIntent,
    paymentElement,
    stripeError,
    isRefreshingIntent,
    currentSetupIntent,
  };
};
