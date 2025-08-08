import { ref, watch } from "vue";
import SubscriptionService from "@/api/settings/subscription-services";

export const usePromoCode = (plan) => {
  const isValidatingPromoCode = ref(false);
  const promoCodeInput = ref("");
  const promoCodeError = ref(null);
  const promoCodeOffer = ref(null);

  const validatePromoCode = () => {
    isValidatingPromoCode.value = true;

    return SubscriptionService.checkPromoCode(
      plan.value.product_id,
      promoCodeInput.value
    )
      .then(({ terms }) => {
        promoCodeOffer.value = { code: promoCodeInput.value, terms };
        promoCodeError.value = null;
        return promoCodeOffer.value;
      })
      .catch(() => {
        promoCodeOffer.value = null;
        promoCodeError.value = "Code is invalid or no longer active.";
        return promoCodeOffer.value;
      })
      .finally(() => {
        isValidatingPromoCode.value = false;
      });
  };

  watch(
    () => promoCodeInput.value,
    (newValue) => {
      if (!newValue) {
        promoCodeOffer.value = null;
        promoCodeError.value = null;
      }
    }
  );

  return {
    isValidatingPromoCode,
    promoCodeInput,
    promoCodeOffer,
    promoCodeError,
    validatePromoCode,
  };
};
