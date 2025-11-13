import type { Format } from "@number-flow/vue";

export const currencyFormatConfig: Format = {
  style: "currency",
  currency: "USD",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export function formatCurrency(amount: number, isCents = true) {
  let value = isCents ? amount / 100 : amount;
  value = Math.max(0, value);

  return value.toLocaleString("en-US", currencyFormatConfig);
}
