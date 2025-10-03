import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import { toValue } from "@vueuse/core";
import type { MaybeRefOrGetter } from "vue";

// Check if the card number is valid using the Luhn algorithm
// https://en.wikipedia.org/wiki/Luhn_algorithm
const luhnCheck = (digits: string) => {
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index--) {
    let digit = digits.charCodeAt(index) - 48;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export const useBankCardNumberValidation = (
  number: MaybeRefOrGetter<string | null>,
  acceptedLengths: MaybeRefOrGetter<number[]> = [16],
  options?: ValidationOptions
) =>
  useValidation(number, options, (number, { isRequired }) => {
    if (!isRequired && !number) {
      return null;
    }

    const _acceptedLengths = toValue(acceptedLengths);
    const rawNumber = number?.replace(/\s/g, "") || "";

    // Check accepted lengths
    if (_acceptedLengths && _acceptedLengths.length > 0) {
      if (!_acceptedLengths.includes(rawNumber.length)) {
        return "Please provide a valid card number";
      }
    }

    if (!luhnCheck(rawNumber)) {
      return "Please provide a valid card number";
    }

    return null;
  });
