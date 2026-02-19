import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import { countryCodeCheck } from "@/scripts/regex.js";
import type { MaybeRefOrGetter } from "vue";

export const useCountryValidation = (
  country: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(country, options, (country, { isRequired }) => {
    if (!isRequired && !country) {
      return null;
    }

    if (!country || !countryCodeCheck(country)) {
      return "Please provide a valid country code";
    }

    return null;
  });
