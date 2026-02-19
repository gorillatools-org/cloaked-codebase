import type { InjectionKey } from "vue";
import type { useStripeElements } from "@/features/checkout/useStripeElements.ts";
import type { useCheckoutSession } from "@/features/checkout/useCheckoutSession.ts";
import type { useHeadlessUser } from "@/features/headless-signup/useHeadlessUser.ts";
import type { usePaypalButtons } from "@/features/checkout/usePaypalButtons.ts";
import type { useCountdownDiscount } from "@/features/checkout/useCountdownDiscount.ts";
import type { useCouponDiscount } from "@/features/checkout/useCouponDiscount.ts";

export const headlessAuthInjectionKey: InjectionKey<
  ReturnType<typeof useHeadlessUser>
> = Symbol("HeadlessAuth");

export const stripeElementsInjectionKey: InjectionKey<
  ReturnType<typeof useStripeElements>
> = Symbol("StripeElements");

export const paypalButtonsInjectionKey: InjectionKey<
  ReturnType<typeof usePaypalButtons>
> = Symbol("PaypalButtons");

export const checkoutSessionInjectionKey: InjectionKey<
  ReturnType<typeof useCheckoutSession>
> = Symbol("CheckoutSession");

export const countdownDiscountInjectionKey: InjectionKey<
  ReturnType<typeof useCountdownDiscount>
> = Symbol("CountdownDiscount");

export const couponDiscountInjectionKey: InjectionKey<
  ReturnType<typeof useCouponDiscount>
> = Symbol("CouponDiscount");
