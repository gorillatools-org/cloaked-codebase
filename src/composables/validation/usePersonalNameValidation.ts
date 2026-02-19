import { personalNameCheck } from "@/scripts/regex.js";
import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import type { MaybeRefOrGetter } from "vue";

export const usePersonalNameValidation = (
  name: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(name, options, (name, { isRequired }) => {
    if (!isRequired && !name) {
      return null;
    }

    if (!name || !personalNameCheck(name)) {
      return "Please provide a valid name";
    }

    return null;
  });
