import { computed, type MaybeRefOrGetter } from "vue";
import { toValue } from "@vueuse/core";
import { isValidPrice } from "@/features/subscribe/composables/utils.ts";

export const useSavings = (
  price: MaybeRefOrGetter<number | null>,
  originalPrice: MaybeRefOrGetter<number | null>
) =>
  computed(() => {
    if (!isValidPrice(price) || !isValidPrice(originalPrice)) {
      return null;
    }

    return Math.round((1 - toValue(price) / toValue(originalPrice)) * 100);
  });
