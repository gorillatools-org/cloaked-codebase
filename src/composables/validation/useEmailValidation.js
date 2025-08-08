import { email as isEmail } from "@/scripts/validation";
import { useValidation } from "@/composables/validation/useValidation.js";

export const useEmailValidation = (email, options) =>
  useValidation(email, options, (email, { isRequired }) => {
    if (!isRequired && !email) {
      return null;
    }

    if (!isEmail(email)) {
      return "Please provide a valid email address";
    }

    return null;
  });
