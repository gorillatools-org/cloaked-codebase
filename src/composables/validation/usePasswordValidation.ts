import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import type { MaybeRefOrGetter } from "vue";

export const usePasswordValidation = (
  password: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(password, options, (password, { isRequired }) => {
    if (!isRequired && !password) {
      return null;
    }

    if (!password || !(password.length > 11 && password.length <= 256)) {
      return "Password must contain between 12 and 256 characters";
    }

    if (!password.match(/[A-Z]+/)) {
      return "Password must contain at least 1 uppercase letter";
    }

    if (!password.match(/[a-z]/)) {
      return "Password must contain at least 1 lowercase letter";
    }

    if (!password.match(/[0-9]/)) {
      return "Password must contain at least 1 number";
    }

    if (!password.match(/[` !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]+/)) {
      return "Password must contain at least 1 special character";
    }

    return null;
  });
