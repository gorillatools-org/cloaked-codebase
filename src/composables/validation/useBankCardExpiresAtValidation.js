import {
  bankCardExpiresAt as isBankCardExpiresAt,
  bankCardExpiresAtInFuture as isBankCardExpiresAtInFuture,
} from "@/scripts/validation";
import { useValidation } from "@/composables/validation/useValidation.js";

export const useBankCardExpiresAtValidation = (expiresAt, options) =>
  useValidation(expiresAt, options, (expiresAt, { isRequired }) => {
    if (!isRequired && !expiresAt) {
      return null;
    }

    if (!isBankCardExpiresAt(expiresAt)) {
      return "Please provide a valid expiration date";
    }

    if (!isBankCardExpiresAtInFuture(expiresAt)) {
      return "Please provide a date in the future";
    }

    return null;
  });
