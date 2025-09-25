import type { InjectionKey } from "vue";
import { useStripeElements } from "@/features/checkout/useStripeElements.ts";
import type { useCheckoutSession } from "@/features/checkout/useCheckoutSession.ts";
import type { useHeadlessUser } from "@/features/headless-signup/useHeadlessUser.ts";

export const stripeElementsInjectionKey: InjectionKey<
  ReturnType<typeof useStripeElements>
> = Symbol("StripeElements");

export const headlessAuthInjectionKey: InjectionKey<
  ReturnType<typeof useHeadlessUser>
> = Symbol("HeadlessAuth");

export const checkoutSessionInjectionKey: InjectionKey<
  ReturnType<typeof useCheckoutSession>
> = Symbol("CheckoutSession");
