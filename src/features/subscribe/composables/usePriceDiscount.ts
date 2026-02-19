import { computed, type MaybeRefOrGetter } from "vue";
import { toValue } from "@vueuse/core";
import {
  isValidDiscount,
  isValidPrice,
  roundedPrice,
} from "@/features/subscribe/composables/utils.ts";

export const usePriceDiscount = (
  price: MaybeRefOrGetter<number | null>,
  discount: MaybeRefOrGetter<number | null>
) =>
  computed(() => {
    if (!isValidPrice(price)) {
      return null;
    }

    return isValidDiscount(discount)
      ? roundedPrice(toValue(price) * (1 - toValue(discount) / 100))
      : null;
  });
