import { useValidation } from "@/composables/validation/useValidation.js";

export const useUsernameValidation = (username, options) =>
  useValidation(username, options, (username, { isRequired }) => {
    if (!isRequired && !username) {
      return null;
    }

    if (!username?.length) {
      return "Please provide a valid username";
    }

    return null;
  });
