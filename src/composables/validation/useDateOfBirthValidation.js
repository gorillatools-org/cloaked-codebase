import moment from "moment";
import { useValidation } from "@/composables/validation/useValidation.js";

export const useDateOfBirthValidation = (dateOfBirth, options) =>
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
