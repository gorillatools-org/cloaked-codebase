import { useValidation } from "@/composables/validation/useValidation.js";

export const useStateValidation = (state, options) =>
  useValidation(state, options, (state, { isRequired }) => {
    if (!isRequired && !state) {
      return null;
    }

    if (!state || state.length !== 2) {
      return "Please provide a valid state";
    }

    return null;
  });
