import { ref, toValue, type TemplateRef, type MaybeRefOrGetter } from "vue";
import { useStripe } from "@/features/checkout/useStripe.ts";
import {
  getStripeAppearance,
  type StripeAppearanceOptions,
} from "@/features/checkout/useStripeAppearance.ts";
import type { SetupIntent } from "@/features/subscribe/types.ts";
import {
  type PaymentMethodCreateParams,
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

  const stripe = ref<Stripe | null>(null);
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

  const confirmPaymentElement = async (
    billingDetails: PaymentMethodCreateParams.BillingDetails
  ) => {
    const stripeValue = toValue(stripe);
    const stripeElementsValue = toValue(stripeElements);

    if (!stripeValue || !stripeElementsValue) {
      stripeError.value = "Failed to confirm payment.";
      return;
    }

    stripeError.value = null;

    const result = await stripeValue.confirmSetup({
      elements: stripeElementsValue,
      confirmParams: {
        payment_method_data: {
          billing_details: billingDetails,
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

  return {
    loadStripe,
    loadStripeElements,
    createPaymentElement,
    mountPaymentElement,
    updatePaymentElement,
    confirmPaymentElement,
    paymentElement,
    stripeError,
  };
};
