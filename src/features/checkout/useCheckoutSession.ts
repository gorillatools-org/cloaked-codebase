import { computed, reactive, toValue } from "vue";
import { watchImmediate } from "@vueuse/core";
import { useRouteQuery } from "@vueuse/router";
import store from "@/store";
import type { User } from "@/types/user.ts";
import { useSubscription } from "@/features/checkout/useSubscription.ts";
import type {
  PlanBilling,
  PlanProvider,
  PlanType,
} from "@/features/subscribe/types.ts";

export type CheckoutSessionStatus =
  | "signing-up"
  | "processing-payment"
  | "signing-in"
  | null;

export type CheckoutSession = {
  status: CheckoutSessionStatus;
  phone: string;
  email: string;
  plan: PlanType;
  billing: PlanBilling;
  method: PlanProvider;
  coupon: string;
  isRegistered: boolean;
  isPaid: boolean;
  isLoggedIn: boolean;
  user: User | null;
};

export const useCheckoutSession = () => {
  const phone = useRouteQuery<string>("phone");
  const email = useRouteQuery<string>("email");

  const plan = useRouteQuery<PlanType>("plan");
  const billing = useRouteQuery<PlanBilling>("billing");
  const method = useRouteQuery<PlanProvider>("method");
  const coupon = useRouteQuery<string>("coupon");

  const session = reactive<CheckoutSession>({
    status: null,
    phone: toValue(phone.value),
    email: toValue(email.value),
    plan: toValue(plan.value) ?? "individual",
    billing: toValue(billing.value) ?? "annually",
    method: toValue(method.value) ?? "stripe",
    coupon: toValue(coupon.value),
    isRegistered: false,
    isPaid: false,
    isLoggedIn: false,
    user: null,
  });

  const { subscription } = useSubscription();

  const user = computed(() => store.getters["authentication/user"]);
  const auth = computed(() => store.state.authentication.auth);

  watchImmediate(user, () => {
    const userValue = toValue(user);

    const isPasswordless = userValue?.is_passwordless;
    const isEncrypted = userValue?.account_version > 1;

    session.user = userValue;
    session.isRegistered = isPasswordless || isEncrypted;
  });

  watchImmediate(subscription, () => {
    const subscriptionValue = toValue(subscription);

    if (!subscriptionValue) {
      return;
    }
    session.isPaid = subscriptionValue.state === "PAID";
  });

  watchImmediate(auth, () => {
    session.isLoggedIn = !!toValue(auth);
  });

  return session;
};
