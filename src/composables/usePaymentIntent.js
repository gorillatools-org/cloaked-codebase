import { computed, ref, watch } from "vue";
import { toValue } from "@vueuse/core";
import { useChangeTracking } from "@/composables/useChangeTracking.js";
import { useStripeIntent } from "@/features/subscribe/composables/useStripeIntent.js";
import { useIntentPrice } from "@/features/subscribe/composables/useIntentPrice.js";
import { useSavings } from "@/features/subscribe/composables/useSavings.js";

const { getIntent } = useStripeIntent();
const { latestChangeId, trackChange } = useChangeTracking();

const paymentIntent = ref(null);

export const usePaymentIntent = (
  plan,
  promoCodeOffer,
  promoCodeError,
  validatePromoCode
) => {
  const isLoadingIntent = ref(false);

  const fetchIntent = async (changeId) => {
    paymentIntent.value = null;
    isLoadingIntent.value = true;

    if (toValue(plan)?.provider !== "stripe") {
      return;
    }

    const intent = await getIntent(
      toValue(plan)?.product_id,
      toValue(promoCodeOffer)?.code ?? null
    ).finally(() => {
      isLoadingIntent.value = false;
    });

    if (changeId === toValue(latestChangeId)) {
      paymentIntent.value = intent;
    }
  };

  const isPromoApplied = computed(
    () => !!toValue(promoCodeOffer) || !!toValue(promoCodeError)
  );

  watch(
    () => toValue(plan),
    async () => {
      const changeId = trackChange();

      if (toValue(isPromoApplied)) {
        const oldOffer = toValue(promoCodeOffer);
        const newOffer = await validatePromoCode();

        if (!oldOffer && !newOffer) {
          await fetchIntent(changeId);
        }
      } else {
        await fetchIntent(changeId);
      }
    },
    { immediate: true }
  );

  watch(
    () => toValue(promoCodeOffer),
    () => fetchIntent(trackChange())
  );

  const originalPrice = useIntentPrice(paymentIntent, "original");
  const finalPrice = useIntentPrice(paymentIntent, "final");
  const promoDiscount = useSavings(finalPrice, originalPrice);

  return {
    isLoadingIntent,
    paymentIntent,
    promoDiscount,
  };
};
