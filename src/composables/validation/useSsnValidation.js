import { useValidation } from "@/composables/validation/useValidation.js";

export const useSsnValidation = (ssn, options) =>
  useValidation(ssn, options, (ssn, { isRequired }) => {
    if (!isRequired && !ssn) {
      return null;
    }

    const [area, group, serial] = ssn?.split("-") ?? "";

    if (
      !Number.isInteger(Number(area)) ||
      !Number.isInteger(Number(group)) ||
      !Number.isInteger(Number(serial)) ||
      area.length !== 3 ||
      group.length !== 2 ||
      serial.length !== 4
    ) {
      return "Please provide a valid social security number";
    }

    return null;
  });
