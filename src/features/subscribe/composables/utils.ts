import { toValue } from "@vueuse/core";
import type { MaybeRefOrGetter } from "vue";

export const isValidPrice = (
  price: MaybeRefOrGetter<number | null>
): price is MaybeRefOrGetter<number> =>
  !!toValue(price) || toValue(price) === 0;

export const isValidDiscount = (
  discount: MaybeRefOrGetter<number | null>
): discount is MaybeRefOrGetter<number> => !!toValue(discount);

export const roundedPrice = (price: MaybeRefOrGetter<number | null>) => {
  if (!isValidPrice(price)) {
    return null;
  }

  return Math.round(toValue(price) * 100) / 100;
};

export const formattedPrice = (
  price: MaybeRefOrGetter<number | null>,
  currency = "$"
) => {
  if (!isValidPrice(price)) {
    return null;
  }

  return `${currency}${toValue(price).toFixed(2)}`;
};
