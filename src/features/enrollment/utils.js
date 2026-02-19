import { parsePhoneNumber } from "awesome-phonenumber";
import { displayAddress } from "@/features/enrollment/composables.js";

export const getFormattedSsnValue = (value) => {
  const [area, group] = value?.split("-") ?? "";

  if (value?.length === 3 && area?.length === 3) {
    return `${value}-`;
  }

  if (value?.length === 6 && area?.length === 3 && group?.length === 2) {
    return `${value}-`;
  }

  return value;
};

export const getFormattedDateOfBirthValue = (value) => {
  const [month, day] = value?.split("-") ?? "";

  if (value?.length === 2 && month?.length === 2) {
    return `${value}-`;
  }

  if (value?.length === 5 && month?.length === 2 && day?.length === 2) {
    return `${value}-`;
  }

  return value;
};

export const getFormattedPhoneNumberValue = (value) => {
  if (!value) {
    return value;
  }

  const parsedPhoneNumber = parsePhoneNumber(value, { regionCode: "US" });
  const international = parsedPhoneNumber?.number?.international;
  const national = parsedPhoneNumber?.number?.national;

  if (
    ["US", "CA"].includes(parsedPhoneNumber?.regionCode ?? "") &&
    national?.length === 14
  ) {
    return `+1 ${national}`;
  }

  if (
    !["US", "CA"].includes(parsedPhoneNumber?.regionCode ?? "") &&
    international
  ) {
    return international;
  }

  return value;
};

export const getFormattedAddressValue = (value) => {
  if (!value) {
    return value;
  }

  return displayAddress(value);
};
