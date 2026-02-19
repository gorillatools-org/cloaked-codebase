import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import type { MaybeRefOrGetter } from "vue";

type Options = {
  originalPassword: MaybeRefOrGetter<string | null>;
};

export const useConfirmPasswordValidation = (
  password: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions & Options
) =>
  useValidation(
    password,
    options,
    (password, { isRequired, originalPassword }) => {
      if (!isRequired && !password) {
        return null;
      }

      if (!!originalPassword && password !== originalPassword) {
        return "Passwords do not match";
      }

      return null;
    }
  );
