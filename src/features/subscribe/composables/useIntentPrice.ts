import { computed, type MaybeRefOrGetter } from "vue";
import { toValue } from "@vueuse/core";
import type { PaymentIntent } from "@/features/subscribe/types.ts";

export const useIntentPrice = (
  intent: MaybeRefOrGetter<PaymentIntent>,
  price: "final" | "original"
) =>
  computed(() => {
    if (!toValue(intent)) {
      return null;
    }

    // prices in intents are strings
    return (
      parseInt(
        price === "final"
          ? toValue(intent).price
          : toValue(intent).original_price
      ) / 100
    );
  });
