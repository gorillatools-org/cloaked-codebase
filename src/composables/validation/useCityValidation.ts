import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import { cityCheck } from "@/scripts/regex.js";
import type { MaybeRefOrGetter } from "vue";

export const useCityValidation = (
  city: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(city, options, (city, { isRequired }) => {
    if (!isRequired && !city) {
      return null;
    }

    if (!city || !cityCheck(city)) {
      return "Please provide a valid city name";
    }

    return null;
  });
