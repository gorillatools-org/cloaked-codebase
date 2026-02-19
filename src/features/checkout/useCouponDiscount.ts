import { ref } from "vue";
import SubscriptionService from "@/api/settings/subscription-services";

type CouponDiscount = {
  terms: string;
  original_price: number;
  price: number;
  percent_off: string;
  amount_off: null;
};

export const useCouponDiscount = () => {
  const discount = ref<number | null>(null);
  const coupon = ref<string | null>(null);
  const couponError = ref<string | null>(null);
  const isValidatingCoupon = ref<boolean>(false);

  const validateCoupon = async (productId?: string, couponCode?: string) => {
    if (!productId || !couponCode) {
      couponError.value = "Please provide a promo code";
      return;
    }

    isValidatingCoupon.value = true;

    try {
      coupon.value = null;
      discount.value = null;
      couponError.value = null;

      const couponDiscount: CouponDiscount =
        await SubscriptionService.validateCoupon(productId, couponCode);

      coupon.value = couponCode;
      discount.value = parseFloat(couponDiscount.percent_off);
      couponError.value = null;
    } catch {
      couponError.value = "Coupon is invalid or no longer active";
    } finally {
      isValidatingCoupon.value = false;
    }
  };

  return {
    discount,
    coupon,
    validateCoupon,
    couponError,
    isValidatingCoupon,
  };
};
