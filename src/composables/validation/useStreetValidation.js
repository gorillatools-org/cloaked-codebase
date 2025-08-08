import { useValidation } from "@/composables/validation/useValidation.js";

export const useStreetValidation = (street, options) =>
  useValidation(street, options, (street, { isRequired }) => {
    if (!isRequired && !street) {
      return null;
    }

    if (!street || !/\d/.test(street)) {
      return "Please provide a valid street";
    }

    return null;
  });
