import { computed } from "vue";
import { toValue } from "@vueuse/core/index";
import { isValidPrice } from "@/features/subscribe/composables/utils.js";

export const useSavings = (price, originalPrice) =>
  computed(() => {
    if (!isValidPrice(price) || !isValidPrice(originalPrice)) {
      return null;
    }

    return Math.round((1 - toValue(price) / toValue(originalPrice)) * 100);
  });
