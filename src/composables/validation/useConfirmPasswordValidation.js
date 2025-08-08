import { useValidation } from "@/composables/validation/useValidation.js";

export const useConfirmPasswordValidation = (password, options) =>
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
