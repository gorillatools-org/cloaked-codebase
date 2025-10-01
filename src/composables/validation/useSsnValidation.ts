import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import { ssn as isValidSsn } from "@/scripts/validation.js";
import type { MaybeRefOrGetter } from "vue";

export const useSsnValidation = (
  ssn: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(ssn, options, (ssn, { isRequired }) => {
    if (!isRequired && !ssn) {
      return null;
    }

    if (!isValidSsn(ssn)) {
      return "Please provide a valid social security number";
    }

    return null;
  });
