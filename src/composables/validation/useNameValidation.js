import { nameCheck } from "@/scripts/regex.js";
import { useValidation } from "@/composables/validation/useValidation.js";

export const useNameValidation = (name, options) =>
  useValidation(name, options, (name, { isRequired }) => {
    if (!isRequired && !name) {
      return null;
    }

    if (!name || !nameCheck(name)) {
      return "Please provide a valid name";
    }

    return null;
  });
