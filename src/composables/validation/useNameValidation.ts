import { nameCheck } from "@/scripts/regex.js";
import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import type { MaybeRefOrGetter } from "vue";

export const useNameValidation = (
  name: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(name, options, (name, { isRequired }) => {
    if (!isRequired && !name) {
      return null;
    }

    if (!name || !nameCheck(name)) {
      return "Please provide a valid name";
    }

    return null;
  });
