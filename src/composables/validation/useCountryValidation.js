import { useValidation } from "@/composables/validation/useValidation.js";

export const useCountryValidation = (country, options) =>
  useValidation(country, options, (country, { isRequired }) => {
    if (!isRequired && !country) {
      return null;
    }

    if (!country || country.length !== 2) {
      return "Please provide a valid country";
    }

    return null;
  });
