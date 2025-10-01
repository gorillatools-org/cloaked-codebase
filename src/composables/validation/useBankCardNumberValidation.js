import { bankCardNumber as isBankCardNumber } from "@/scripts/validation";
import { useValidation } from "@/composables/validation/useValidation.js";

export const useBankCardNumberValidation = (number, options) =>
  useValidation(number, options, (number, { isRequired }) => {
    if (!isRequired && !number) {
      return null;
    }

    if (!isBankCardNumber(number)) {
      return "Please provide a valid card number";
    }

    return null;
  });
