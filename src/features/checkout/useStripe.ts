import { loadStripe as load, type Stripe } from "@stripe/stripe-js";

let stripeLoadPromise: Promise<Stripe | null> | null = null;

export const useStripe = () => {
  const loadStripe = async () => {
    if (!import.meta.env.VITE_STRIPE) {
      throw new Error("VITE_STRIPE is not defined.");
    }

    if (stripeLoadPromise) {
      return stripeLoadPromise;
    }

    stripeLoadPromise = load(import.meta.env.VITE_STRIPE);

    return stripeLoadPromise;
  };

  return {
    loadStripe,
  };
};
