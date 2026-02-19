import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import { addressStreetCheck } from "@/scripts/regex.js";
import type { MaybeRefOrGetter } from "vue";

export const useStreetValidation = (
  street: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(street, options, (street, { isRequired }) => {
    if (!isRequired && !street) {
      return null;
    }

    if (!street || !addressStreetCheck(street)) {
      return "Please provide a valid street address";
    }

    return null;
  });
