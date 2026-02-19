import moment from "moment";
import {
  useValidation,
  type ValidationOptions,
} from "@/composables/validation/useValidation.js";
import type { MaybeRefOrGetter } from "vue";

export const useDateOfBirthValidation = (
  dateOfBirth: MaybeRefOrGetter<string | null>,
  options?: ValidationOptions
) =>
  useValidation(dateOfBirth, options, (dateOfBirth, { isRequired }) => {
    if (!isRequired && !dateOfBirth) {
      return null;
    }

    const date = moment(dateOfBirth, "MM-DD-YYYY", true);
    const now = moment();

    if (
      !date.isValid() ||
      now.diff(date, "years") < 0 ||
      now.diff(date, "years") > 100
    ) {
      return "Please provide a valid date (MM-DD-YYYY)";
    }

    if (now.diff(date, "years") < 18) {
      return "You must be at least 18 years old";
    }

    return null;
  });
