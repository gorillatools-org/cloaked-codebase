import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import type { MaybeRefOrGetter } from "vue";

export const useUsernameValidation = (
  username: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(username, options, (username, { isRequired }) => {
    if (!isRequired && !username) {
      return null;
    }

    if (!username?.length) {
      return "Please provide a valid username";
    }

    return null;
  });
