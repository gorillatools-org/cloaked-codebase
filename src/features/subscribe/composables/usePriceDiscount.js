import { computed } from "vue";
import { toValue } from "@vueuse/core";
import {
  isValidPrice,
  roundedPrice,
} from "@/features/subscribe/composables/utils.js";

export const usePriceDiscount = (price, discount) =>
  computed(() => {
    if (!isValidPrice(price)) {
      return null;
    }

    return toValue(discount)
      ? roundedPrice(toValue(price) * (1 - toValue(discount) / 100))
      : null;
  });
