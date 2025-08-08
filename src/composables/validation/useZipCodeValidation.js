import { useValidation } from "@/composables/validation/useValidation.js";

export const useZipCodeValidation = (zipCode, options) =>
  useValidation(zipCode, options, (zipCode, { isRequired }) => {
    if (!isRequired && !zipCode) {
      return null;
    }

    if (!zipCode || zipCode.length < 5) {
      return "Please provide a valid zip code";
    }

    return null;
  });
