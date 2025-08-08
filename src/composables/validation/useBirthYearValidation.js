import { useValidation } from "@/composables/validation/useValidation.js";

export const useBirthYearValidation = (birthYear, options) =>
  useValidation(birthYear, options, (birthYear, { isRequired }) => {
    if (!isRequired && !birthYear) {
      return null;
    }

    const currentYear = new Date().getFullYear();

    if (isNaN(birthYear) || birthYear < 1900 || currentYear - birthYear < 0) {
      return "Please enter a valid birth year";
    } else if (currentYear - birthYear > 0 && currentYear - birthYear <= 13) {
      return "Cloaked isn't intended for use by individuals under 13 years of age";
    } else if (currentYear - birthYear < 18) {
      return "Data deletion enrollment is not supported for users under the age of 18";
    }

    return null;
  });
