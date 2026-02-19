import { loadScript as load, type PayPalNamespace } from "@paypal/paypal-js";

let paypalLoadPromise: Promise<PayPalNamespace | null> | null = null;

export const usePaypal = () => {
  const loadPaypal = async () => {
    if (!import.meta.env.VITE_PAYPAL_CLIENT) {
      throw new Error("VITE_PAYPAL_CLIENT is not defined.");
    }

    if (paypalLoadPromise) {
      return paypalLoadPromise;
    }

    paypalLoadPromise = load({
      clientId: import.meta.env.VITE_PAYPAL_CLIENT,
      vault: true,
      intent: "subscription",
      components: ["buttons"],
      disableFunding: ["card", "credit"],
    });

    return paypalLoadPromise;
  };

  return {
    loadPaypal,
  };
};
