import { toValue } from "@vueuse/core/index";

export const isValidPrice = (price) => toValue(price) || toValue(price) === 0;

export const roundedPrice = (price) => {
  if (!isValidPrice(price)) {
    return null;
  }

  return Math.round(toValue(price) * 100) / 100;
};

export const formattedPrice = (price, currency = "$") => {
  if (!isValidPrice(price)) {
    return null;
  }

  return `${currency}${toValue(price).toFixed(2)}`;
};
