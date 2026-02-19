import { ref, toValue, type TemplateRef, type MaybeRefOrGetter } from "vue";
import { useStripe } from "@/features/checkout/useStripe.ts";
import {
  type StripeAppearanceResolver,
  type StripeAppearanceOptions,
} from "@/features/checkout/stripeAppearance.ts";
import { generateConsistentFakeName } from "@/utils/generateFakeName";
import type { SetupIntent } from "@/features/subscribe/types.ts";
import {
  type Stripe,
  type StripeElements,
  type StripePaymentElement,
} from "@stripe/stripe-js";

export const useStripeElements = () => {
  const { loadStripe: loadStripeLibrary } = useStripe();

  const stripeAppearance = ref<StripeAppearanceOptions>({
    scheme: "light",
    readOnly: false,
    error: false,
  });

  let getAppearance: StripeAppearanceResolver | null = null;

  const useStripeAppearance = (fn: StripeAppearanceResolver) => {
    getAppearance = fn;
  };

  const stripe = ref<Stripe | null>(null);
  const stripeIntent = ref<SetupIntent | null>(null);
  const stripeElements = ref<StripeElements | null>(null);
  const paymentElement = ref<StripePaymentElement | null>(null);
  const stripeError = ref<string | null>(null);

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

    stripeIntent.value = intentValue;
    stripeElements.value = stripeValue.elements({
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

    stripeElementsValue.update({ appearance: getAppearance?.(appearance) });
    paymentElementValue.update({ readOnly: appearance.readOnly });

    stripeAppearance.value = appearance;
  };

  /**
   * Triggers validation and wallet payment sheets (Apple Pay / Google Pay).
   * Must be called directly from a user gesture so the browser still
   * considers the event a "user activation".
   */
  const submitPaymentElement = async () => {
    const stripeElementsValue = toValue(stripeElements);

    if (!stripeElementsValue) {
      stripeError.value = "Failed to submit payment.";
      return false;
    }

    stripeError.value = null;

    const { error } = await stripeElementsValue.submit();

    if (error) {
      stripeError.value = error.message ?? "Could not process payment.";
      return false;
    }

    return true;
  };

  /**
   * Finalises the SetupIntent after elements.submit() has already collected
   * payment details. Safe to call after async work - no user activation needed.
   */
  const confirmPaymentElement = async () => {
    const stripeValue = toValue(stripe);
    const stripeElementsValue = toValue(stripeElements);
    const intentValue = toValue(stripeIntent);

    if (!stripeValue || !stripeElementsValue || !intentValue) {
      stripeError.value = "Failed to confirm payment.";
      return;
    }

    stripeError.value = null;

    const result = await stripeValue.confirmSetup({
      elements: stripeElementsValue,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: generateConsistentFakeName(intentValue.email),
            email: intentValue.email,
          },
        },
      },
      redirect: "if_required",
    });

    if (result.error || !result?.setupIntent?.payment_method) {
      stripeError.value = "Could not process payment.";
      return;
    }

    return result.setupIntent.payment_method;
  };

  const unmountPaymentElement = () => {
    const stripeElementsValue = toValue(stripeElements);
    const paymentElementValue = toValue(paymentElement);

    if (!stripeElementsValue || !paymentElementValue) {
      stripeError.value = "Failed to unmount payment element.";
      return;
    }

    paymentElementValue.unmount();

    paymentElement.value = null;
    stripeElements.value = null;
    stripeIntent.value = null;
  };

  return {
    loadStripe,
    loadStripeElements,
    useStripeAppearance,
    createPaymentElement,
    mountPaymentElement,
    updatePaymentElement,
    submitPaymentElement,
    confirmPaymentElement,
    unmountPaymentElement,
    paymentElement,
    stripeError,
    stripe,
  };
};
