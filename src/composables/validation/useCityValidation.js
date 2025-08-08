import { useValidation } from "@/composables/validation/useValidation.js";

export const useCityValidation = (city, options) =>
  useValidation(city, options, (city, { isRequired }) => {
    if (!isRequired && !city) {
      return null;
    }

    if (!city) {
      return "Please provide a valid city";
    }

    return null;
  });
