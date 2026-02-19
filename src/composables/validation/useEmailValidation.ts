import { email as isEmail } from "@/scripts/validation";
import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import type { MaybeRefOrGetter } from "vue";

export const useEmailValidation = (
  email: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(email, options, (email, { isRequired }) => {
    if (!isRequired && !email) {
      return null;
    }

    if (!isEmail(email)) {
      return "Please provide a valid email address";
    }

    return null;
  });
