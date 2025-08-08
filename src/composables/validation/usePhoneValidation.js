import { phone as isValidPhone } from "@/scripts/validation";
import { useValidation } from "@/composables/validation/useValidation.js";

export const usePhoneValidation = (phone, options) =>
  useValidation(phone, options, (phone, { isRequired }) => {
    if (!isRequired && !phone) {
      return null;
    }

    if (!isValidPhone(phone)) {
      return "Please provide a valid phone number";
    }

    return null;
  });
