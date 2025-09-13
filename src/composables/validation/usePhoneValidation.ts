import { phone as isValidPhone } from "@/scripts/validation";
import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import type { MaybeRefOrGetter } from "vue";

export const usePhoneValidation = (
  phone: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(phone, options, (phone, { isRequired }) => {
    if (!isRequired && !phone) {
      return null;
    }

    if (!isValidPhone(phone)) {
      return "Please provide a valid phone number";
    }

    return null;
  });
