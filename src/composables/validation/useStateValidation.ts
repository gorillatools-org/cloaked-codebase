import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import { stateCheck } from "@/scripts/regex.js";
import type { MaybeRefOrGetter } from "vue";

export const useStateValidation = (
  state: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(state, options, (state, { isRequired }) => {
    if (!isRequired && !state) {
      return null;
    }

    if (!state || !stateCheck(state)) {
      return "Please provide a valid state/province";
    }

    return null;
  });
