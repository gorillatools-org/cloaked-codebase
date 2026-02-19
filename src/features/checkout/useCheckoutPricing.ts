import { toRef, type Ref } from "vue";
import { useSelectedPlan } from "@/features/checkout/useSelectedPlan.ts";
import { usePlanPrice } from "@/features/subscribe/composables/usePlanPrice.ts";
import { usePriceAnchor } from "@/features/subscribe/composables/usePriceAnchor.ts";
import { usePriceDiscount } from "@/features/subscribe/composables/usePriceDiscount.ts";
import type { useCheckoutSession } from "@/features/checkout/useCheckoutSession.ts";
import type { useCountdownDiscount } from "@/features/checkout/useCountdownDiscount.ts";
import type { useCouponDiscount } from "@/features/checkout/useCouponDiscount.ts";
import type { Plan } from "@/features/subscribe/types.ts";

type UseCheckoutPricingDeps = {
  plans: Ref<Plan[]>;
  checkoutSession: ReturnType<typeof useCheckoutSession> | undefined;
  countdownDiscount: ReturnType<typeof useCountdownDiscount> | undefined;
  couponDiscount: ReturnType<typeof useCouponDiscount> | undefined;
};

export const useCheckoutPricing = (deps: UseCheckoutPricingDeps) => {
  const { plans, checkoutSession, countdownDiscount, couponDiscount } = deps;

  const selectedPlan = useSelectedPlan(plans, checkoutSession);
  const price = usePlanPrice(selectedPlan);

  const anchoredPrice = usePriceAnchor(
    price,
    countdownDiscount?.discount ?? null
  );

  const discountedPrice = usePriceDiscount(
    price,
    toRef(() =>
      checkoutSession?.method === "stripe"
        ? (couponDiscount?.discount.value ?? null)
        : null
    )
  );

  return {
    selectedPlan,
    price,
    anchoredPrice,
    discountedPrice,
  };
};
