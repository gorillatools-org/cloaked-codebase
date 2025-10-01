import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import { postalCodeCheck } from "@/scripts/regex.js";
import type { MaybeRefOrGetter } from "vue";

export const useZipCodeValidation = (
  zipCode: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(zipCode, options, (zipCode, { isRequired }) => {
    if (!isRequired && !zipCode) {
      return null;
    }

    if (!zipCode || !postalCodeCheck(zipCode)) {
      return "Please provide a valid zip/postal code";
    }

    return null;
  });
