import { url as isValidUrl } from "@/scripts/validation";

export const isValidDate = (value) =>
  new Date(value).toString() !== "Invalid Date";

export const isEmpty = (value) =>
  value === null || value === undefined || value === "";

export const required = (value, errors = []) => {
  if (isEmpty(value)) {
    errors.push("This field is required");
  }

  return errors;
};

export const url = (value, errors = []) => {
  if (!isValidUrl(value)) {
    errors.push("Check the format of your URL");
  }

  return errors;
};

export const date = (value, errors = []) => {
  if (!value.match(/^\d{4}-\d{2}-\d{2}$/) || !isValidDate(value)) {
    errors.push("Date should be formatted as YYYY-MM-DD");
  }

  return errors;
};

export const atLeastOneRequired =
  (keys = []) =>
  (value, errors = []) => {
    if (
      keys.every(
        (key) =>
          value?.[key] === null ||
          value?.[key] === undefined ||
          value?.[key] === ""
      )
    ) {
      errors.push("At least one field is required");
    }

    return errors;
  };

export const validationsUrl = {
  value: [url],
};

export const validationsDate = {
  value: [date],
};

export const hasErrors = (errors) => {
  if (Object.values(errors).some((value) => value.length > 0)) {
    return true;
  }

  return Object.keys(errors).some((key) => hasErrors(errors[key]));
};
