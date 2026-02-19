import { useValidation } from "@/composables/validation/useValidation.js";

export const useBankCardSecurityCodeValidation = (securityCode, options) =>
  useValidation(securityCode, options, (securityCode, { isRequired }) => {
    if (!isRequired && !securityCode) {
      return null;
    }

    if (!securityCode || ![3, 4].includes(securityCode.length)) {
      return "Please provide a valid security code";
    }

    return null;
  });
