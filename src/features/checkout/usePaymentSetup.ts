import { computed, type Ref, type TemplateRef } from "vue";
import { watchImmediate, until } from "@vueuse/core";
import SubscriptionService from "@/api/settings/subscription-services";
import { getStripeAppearanceCheckout } from "@/features/checkout/stripeAppearanceCheckout.ts";
import { useColorScheme } from "@/composables/useColorScheme.ts";
import { useSelectedPlan } from "@/features/checkout/useSelectedPlan.ts";
import type { useHeadlessUser } from "@/features/headless-signup/useHeadlessUser.ts";
import type { useStripeElements } from "@/features/checkout/useStripeElements.ts";
import type { usePaypalButtons } from "@/features/checkout/usePaypalButtons.ts";
import type { useCheckoutSession } from "@/features/checkout/useCheckoutSession.ts";
import type { Plan } from "@/features/subscribe/types.ts";

type UsePaymentSetupDeps = {
  plans: Ref<Plan[]>;
  stripeRef: TemplateRef<HTMLDivElement>;
  paypalRef: TemplateRef<HTMLDivElement>;
  onComplete: () => void;
  headlessAuth: ReturnType<typeof useHeadlessUser> | undefined;
  stripeElements: ReturnType<typeof useStripeElements> | undefined;
  paypalButtons: ReturnType<typeof usePaypalButtons> | undefined;
  checkoutSession: ReturnType<typeof useCheckoutSession> | undefined;
};

export const usePaymentSetup = (deps: UsePaymentSetupDeps) => {
  const { colorScheme } = useColorScheme();

  const {
    plans,
    stripeRef,
    paypalRef,
    onComplete,
    headlessAuth,
    stripeElements,
    paypalButtons,
    checkoutSession,
  } = deps;

  const selectedPlan = useSelectedPlan(plans, checkoutSession);

  const isStripeReady = computed(() => !!stripeElements?.stripe?.value);
  const isPaypalReady = computed(() => !!paypalButtons?.paypal?.value);
  const isUserReady = computed(() => !!headlessAuth?.headlessUser?.value);

  const isReadOnly = computed(
    () => !!checkoutSession?.status || !!checkoutSession?.isPaid
  );

  const loadStripe = async () => {
    try {
      await until(isStripeReady).toBe(true);
      await until(isUserReady).toBe(true);

      const intent = await SubscriptionService.createSetupIntent();

      stripeElements?.loadStripeElements(intent);
      stripeElements?.createPaymentElement();
      stripeElements?.useStripeAppearance(getStripeAppearanceCheckout);
      stripeElements?.mountPaymentElement(stripeRef, {
        scheme: colorScheme.value,
      });

      watchImmediate(colorScheme, () =>
        stripeElements?.updatePaymentElement({ scheme: colorScheme.value })
      );

      watchImmediate(isReadOnly, () => {
        stripeElements?.updatePaymentElement({ readOnly: isReadOnly.value });
      });
    } catch (error) {
      console.error("Error initializing Stripe payment:", error);
    }
  };

  const loadPaypal = async () => {
    try {
      await until(isPaypalReady).toBe(true);
      await until(isUserReady).toBe(true);

      watchImmediate(selectedPlan, (plan) => {
        if (!checkoutSession || !plan) {
          return;
        }

        if (checkoutSession.method === "paypal") {
          paypalButtons?.mountButtonElement(paypalRef, {
            plan_id: plan.price_id ?? "",
            custom_id: headlessAuth?.headlessUser.value?.uuid ?? "",
            onSubscribed: onComplete,
          });
        }
      });
    } catch (error) {
      console.error("Error initializing Paypal payment:", error);
    }
  };

  /** Recreates Stripe payment element (e.g., after a failed payment attempt). */
  const refreshStripeIntent = async () => {
    try {
      const intent = await SubscriptionService.createSetupIntent();

      stripeElements?.unmountPaymentElement();
      stripeElements?.loadStripeElements(intent);
      stripeElements?.createPaymentElement();
      stripeElements?.mountPaymentElement(stripeRef, {});

      return true;
    } catch {
      return false;
    }
  };

  return {
    selectedPlan,
    isReadOnly,
    loadStripe,
    loadPaypal,
    refreshStripeIntent,
  };
};
