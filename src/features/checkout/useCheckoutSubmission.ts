import { ref, toValue, type Ref } from "vue";
import SubscriptionService from "@/api/settings/subscription-services";
import { useSelectedPlan } from "@/features/checkout/useSelectedPlan.ts";
import { useSubscription } from "@/features/checkout/useSubscription.ts";
import type { useStripeElements } from "@/features/checkout/useStripeElements.ts";
import type { usePaypalButtons } from "@/features/checkout/usePaypalButtons.ts";
import type { useHeadlessUser } from "@/features/headless-signup/useHeadlessUser.ts";
import type { useCheckoutSession } from "@/features/checkout/useCheckoutSession.ts";
import type { useAccountRecovery } from "@/features/checkout/useAccountRecovery.ts";
import type { useCouponDiscount } from "@/features/checkout/useCouponDiscount.ts";
import type { Plan } from "@/features/subscribe/types.ts";
import type { SignupCredentials } from "@/features/headless-signup/types.ts";
import { CHECKOUT_SUBMISSION_ERRORS } from "./constants";

type CheckoutStepHandler = () => Promise<boolean>;

export type UseCheckoutSubmissionDeps = {
  plans: Ref<Plan[]>;
  verifyAccountForm: () => Promise<SignupCredentials | false>;
  refreshStripeIntent: () => Promise<void>;
  stripeElements: ReturnType<typeof useStripeElements> | undefined;
  paypalButtons: ReturnType<typeof usePaypalButtons> | undefined;
  headlessAuth: ReturnType<typeof useHeadlessUser> | undefined;
  checkoutSession: ReturnType<typeof useCheckoutSession> | undefined;
  accountRecovery: ReturnType<typeof useAccountRecovery> | undefined;
  couponDiscount: ReturnType<typeof useCouponDiscount> | undefined;
};

type SubmitOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useCheckoutSubmission(deps: UseCheckoutSubmissionDeps) {
  const {
    plans,
    verifyAccountForm,
    refreshStripeIntent,
    stripeElements,
    paypalButtons,
    headlessAuth,
    checkoutSession,
    accountRecovery,
    couponDiscount,
  } = deps;

  const selectedPlan = useSelectedPlan(plans, checkoutSession);
  const subscription = useSubscription();

  const createAccountError = ref<string | null>(null);
  const processPaymentError = ref<string | null>(null);
  const logInError = ref<string | null>(null);

  /** Registers the user account. Skips if already registered. */
  const createAccount: CheckoutStepHandler = async () => {
    if (!checkoutSession || !headlessAuth) {
      return false;
    }

    if (checkoutSession.isRegistered) {
      return true;
    }

    checkoutSession.status = "signing-up";

    const credentials = await verifyAccountForm();

    if (!credentials) {
      return false;
    }

    await headlessAuth.updateHeadlessUser(credentials);

    if (headlessAuth.updateHeadlessUserError.value) {
      return false;
    }

    await headlessAuth.fetchHeadlessUser();

    return checkoutSession.isRegistered;
  };

  /** Confirms Stripe payment and creates subscription. */
  const processStripePayment: CheckoutStepHandler = async () => {
    if (!checkoutSession || !stripeElements) {
      return false;
    }

    if (checkoutSession.isPaid) {
      return true;
    }

    checkoutSession.status = "processing-payment";

    const paymentMethodId = await stripeElements.confirmPaymentElement();

    if (stripeElements.stripeError.value || !paymentMethodId) {
      return false;
    }

    try {
      await SubscriptionService.subscribe({
        price_id: toValue(selectedPlan)?.price_id,
        promo_code: toValue(couponDiscount?.coupon) ?? undefined,
        payment_method_id: paymentMethodId,
      });
    } catch {
      await refreshStripeIntent();
      return false;
    }

    await subscription.pollSubscription("PAID");

    return checkoutSession.isPaid;
  };

  /** Registers PayPal subscription after external approval. */
  const processPayPalPayment: CheckoutStepHandler = async () => {
    if (!checkoutSession || !paypalButtons) {
      return false;
    }

    if (checkoutSession.isPaid) {
      return true;
    }

    checkoutSession.status = "processing-payment";

    if (paypalButtons.paypalError.value) {
      return false;
    }

    try {
      await SubscriptionService.registerPaypal(
        paypalButtons.paypalSubscriptionId.value
      );
    } catch {
      return false;
    }

    await subscription.pollSubscription("PAID");

    return checkoutSession.isPaid;
  };

  /** Authenticates the user after account creation. */
  const logIn: CheckoutStepHandler = async () => {
    if (!checkoutSession || !headlessAuth) {
      return false;
    }

    if (checkoutSession.isLoggedIn) {
      return true;
    }

    checkoutSession.status = "signing-in";

    const credentials = await headlessAuth.loginHeadlessUser();

    if (headlessAuth.loginUserError.value) {
      return false;
    }

    if (accountRecovery && credentials) {
      if ("phone" in credentials) {
        accountRecovery.value = {
          username: credentials.phone,
          password: null,
          recovery: null,
        };
      } else {
        const recovery = await headlessAuth.encryptHeadlessUser();

        if (headlessAuth.encryptHeadlessUserError.value) {
          return false;
        }

        accountRecovery.value = {
          username: credentials.username,
          password: credentials.password,
          recovery,
        };
      }
    }

    return checkoutSession.isLoggedIn;
  };

  /** Stripe flow: submitPayment → createAccount → logIn → processPayment → onSuccess */
  const submitStripe = async (options?: SubmitOptions) => {
    if (!checkoutSession || !stripeElements) {
      return;
    }

    createAccountError.value = null;
    processPaymentError.value = null;
    logInError.value = null;

    const isSubmitted = await stripeElements.submitPaymentElement();

    if (!isSubmitted) {
      checkoutSession.status = null;
      processPaymentError.value = CHECKOUT_SUBMISSION_ERRORS.submitPayment;
      return;
    }

    const isRegistered = await createAccount();

    if (!isRegistered) {
      checkoutSession.status = null;
      createAccountError.value = CHECKOUT_SUBMISSION_ERRORS.createAccount;
      return;
    }

    const isLoggedIn = await logIn();

    if (!isLoggedIn) {
      logInError.value = CHECKOUT_SUBMISSION_ERRORS.logIn;
      checkoutSession.status = null;
      return;
    }

    const isPaid = await processStripePayment();

    if (!isPaid) {
      checkoutSession.status = null;
      processPaymentError.value = CHECKOUT_SUBMISSION_ERRORS.processPayment;
      return;
    }

    await options?.onSuccess?.();

    checkoutSession.status = null;
  };

  /** PayPal flow: createAccount → logIn → processPayment → onSuccess (resumes partial flows) */
  const submitPaypal = async (options?: SubmitOptions) => {
    if (!checkoutSession) {
      return;
    }

    createAccountError.value = null;
    processPaymentError.value = null;
    logInError.value = null;

    if (!checkoutSession.isRegistered) {
      const isRegistered = await createAccount();

      if (!isRegistered) {
        checkoutSession.status = null;
        createAccountError.value = CHECKOUT_SUBMISSION_ERRORS.createAccount;
        return;
      }
    }

    if (!checkoutSession.isLoggedIn) {
      const isLoggedIn = await logIn();

      if (!isLoggedIn) {
        logInError.value = CHECKOUT_SUBMISSION_ERRORS.logIn;
        checkoutSession.status = null;
        return;
      }

      checkoutSession.status = null;
      return;
    }

    const isPaid = await processPayPalPayment();

    if (!isPaid) {
      checkoutSession.status = null;
      processPaymentError.value = CHECKOUT_SUBMISSION_ERRORS.processPayment;
      return;
    }

    await options?.onSuccess?.();

    checkoutSession.status = null;
  };

  /** Main submission handler. Routes to Stripe or PayPal based on checkout method. */
  const submit = (options?: SubmitOptions) => {
    if (!checkoutSession) {
      return;
    }

    return checkoutSession.method === "stripe"
      ? submitStripe(options)
      : submitPaypal(options);
  };

  return {
    createAccountError,
    processPaymentError,
    logInError,
    submit,
    submitStripe,
    submitPaypal,
    createAccount,
    processStripePayment,
    processPayPalPayment,
    logIn,
  };
}
