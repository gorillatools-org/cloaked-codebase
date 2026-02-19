import { ref, type TemplateRef, toValue } from "vue";
import { usePaypal } from "@/features/checkout/usePaypal.ts";
import type { PayPalNamespace } from "@paypal/paypal-js";

type PaypalButtonOptions = {
  plan_id: string;
  custom_id: string;
  onSubscribed: () => void;
};

export const usePaypalButtons = () => {
  const { loadPaypal: loadPaypalLibrary } = usePaypal();

  const paypal = ref<PayPalNamespace | null>(null);
  const paypalButtons = ref<PayPalNamespace["Buttons"] | null>(null);
  const paypalSubscriptionId = ref<string | null>(null);
  const paypalError = ref<string | null>(null);

  const loadPaypal = async () => {
    try {
      paypal.value = await loadPaypalLibrary();
      paypalButtons.value = paypal.value?.Buttons ?? null;
    } catch {
      paypalError.value = "Failed to load paypal.";
    }
  };

  const mountButtonElement = (
    element: TemplateRef<HTMLDivElement>,
    options: PaypalButtonOptions
  ) => {
    const elementValue = toValue(element);
    const paypalButtonsValue = toValue(paypalButtons);

    if (!elementValue || !paypalButtonsValue) {
      paypalError.value = "Failed to mount button element.";
      return;
    }

    elementValue.innerHTML = "";

    paypalButtonsValue({
      // https://developer.paypal.com/sdk/js/reference/#style
      style: {
        shape: "pill",
        color: "gold",
        tagline: false,
        layout: "horizontal",
        label: "subscribe",
        disableMaxWidth: true,
        height: 55,
      },
      createSubscription: async (_data, actions) => {
        paypalError.value = null;

        // yes, it must return the result of this call
        return actions.subscription.create({
          plan_id: options.plan_id,
          custom_id: options.custom_id,
        });
      },
      onApprove: async ({ subscriptionID }) => {
        if (subscriptionID) {
          paypalSubscriptionId.value = subscriptionID;
          options.onSubscribed();
        } else {
          paypalError.value = "Could not process payment.";
        }
      },
      onError: () => {
        paypalError.value = "Could not process payment.";
      },
    }).render(elementValue);
  };

  return {
    loadPaypal,
    mountButtonElement,
    paypalButtons,
    paypalSubscriptionId,
    paypalError,
    paypal,
  };
};
