import { computed, reactive, toValue, watch } from "vue";
import { useRouteParams, useRouteQuery } from "@vueuse/router";
import { useTierSubscription } from "@/features/checkout/useTierSubscription.ts";
import { useRoute } from "vue-router";
import store from "@/store";
import type { TierBilling } from "@/features/subscribe/types.ts";
import type { User } from "@/types/user.ts";

export type CheckoutSessionStatus =
  | "signing-up"
  | "processing-payment"
  | "signing-in"
  | null;

export type CheckoutSession = {
  status: CheckoutSessionStatus;
  phone: string;
  email: string;
  selectedTier: string;
  selectedBilling: TierBilling;
  subscribedTier: string | null;
  subscribedBilling: TierBilling | null;
  isRegistered: boolean;
  isPaid: boolean;
  isLoggedIn: boolean;
  user: User | null;
};

export const useCheckoutSession = () => {
  const phone = useRouteQuery<string>("phone");
  const email = useRouteQuery<string>("email");

  const tier = useRouteParams<string>("tier");
  const billing = useRouteParams<TierBilling>("billing");

  const session = reactive<CheckoutSession>({
    status: null,
    phone: toValue(phone.value),
    email: toValue(email.value),
    selectedTier: toValue(tier.value),
    selectedBilling: toValue(billing.value) ?? "yearly",
    subscribedTier: null,
    subscribedBilling: null,
    isRegistered: false,
    isPaid: false,
    isLoggedIn: false,
    user: null,
  });

  const route = useRoute();
  const { subscription } = useTierSubscription();

  const user = computed(() => store.getters["authentication/user"]);
  const auth = computed(() => store.state.authentication.auth);

  watch(
    () => ({
      selectedTier: session.selectedTier,
      selectedBilling: session.selectedBilling,
    }),
    (newSession) => {
      tier.value = newSession.selectedTier;
      billing.value = newSession.selectedBilling;
    }
  );

  watch(route, () => {
    session.selectedTier = toValue(tier);
    session.selectedBilling = toValue(billing) ?? "yearly";
  });

  watch(user, () => {
    const userValue = toValue(user);

    const isPasswordless = userValue?.is_passwordless;
    const isEncrypted = userValue?.account_version > 1;

    session.user = userValue;
    session.isRegistered = isPasswordless || isEncrypted;
  });

  watch(subscription, () => {
    const subscriptionValue = toValue(subscription);

    if (!subscriptionValue) {
      return;
    }

    const { tier_code, billing_interval } = subscriptionValue;

    session.isPaid = !!subscriptionValue;
    session.subscribedTier = tier_code;
    session.subscribedBilling =
      billing_interval === "year" ? "yearly" : "monthly";
  });

  watch(auth, () => {
    session.isLoggedIn = !!toValue(auth);
  });

  return session;
};
