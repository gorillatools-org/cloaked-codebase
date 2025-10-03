import { bankCardExpiresAtStringToDate } from "@/scripts/tools.js";
import { parsePhoneNumber } from "awesome-phonenumber";
// NOTE: file size conversion = bits * bytes * megabytes
export const FILE_SIZE_LIMIT = 20 * 1024 * 1024;
export const password = (value) => {
  const rules = new RegExp(/^[a-zA-Z0-9-@#_]{8,20}/, "i");
  return rules.exec(value);
};

export const email = (value) => {
  const rules = new RegExp(
    /^[a-zA-Z0-9~\-_.+]+@[a-zA-Z0-9\-_]+\.[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/,
    "i"
  );
  return !!rules.exec(value);
};

export const phone = (value, region = "US") => {
  const asInternationalNumber = parsePhoneNumber(value, { regionCode: region });
  const asUsaNumber = parsePhoneNumber(value, { regionCode: "US" });
  return asInternationalNumber.valid || asUsaNumber.valid;
};

export const url = (value) => {
  if (value) {
    let url = value.match(/https?:\/\//)
      ? value
      : `https://${value.replaceAll(/^[^a-zA-Z0-9]+/g, "")}`;
    const rules = new RegExp(
      /(http(s)?:\/\/)(www.)?[a-zA-Z0-9@:%._+~#=-]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=-]*)/,
      "i"
    );
    if (rules.exec(url)) {
      return !!url;
    }
  }
  return false;
};

export const maxPayload = (files) => {
  if (files.length > 0) {
    const max = files.reduce((size, file) => {
      return size + file.size;
    }, 0);
    return max >= FILE_SIZE_LIMIT;
  }
  if (files.length > 5) {
    return true;
  }
  return false;
};

export const formatMultiplePillEntries = (incoming) => {
  if (incoming.includes("\t")) {
    const split = incoming.split("\t");
    incoming = split;
  } else if (incoming.includes(",")) {
    const split = incoming.split(",");
    incoming = split;
  } else if (incoming.includes(" +")) {
    const split = incoming
      .split(" +")
      .filter((item) => item !== " " && item !== "");
    incoming = split;
  } else {
    incoming = [incoming];
  }

  return incoming.map((item) => item.trim()).filter((item) => !!item);
};

export const ssn = (value) => {
  const rules = new RegExp(
    /^(?!(000|666|9))\d{3}-?(?!00)\d{2}-?(?!0000)\d{4}$/
  );
  return !!rules.exec(value);
};

export const bankCardExpiresAt = (value) => {
  const rules = new RegExp(/^\d{2}\/\d{2}$/, "i");
  return rules.exec(value);
};

export const bankCardExpiresAtInFuture = (value) => {
  const now = new Date().setHours(0, 0, 0, 0);
  const expiresAtDate = bankCardExpiresAtStringToDate(value);
  return expiresAtDate > now;
};

// use helpers/formattedText

export const validation = {
  password,
  email,
  phone,
  url,
  maxPayload,
  formatMultiplePillEntries,
  ssn,
  bankCardExpiresAt,
  bankCardExpiresAtInFuture,
  FILE_SIZE_LIMIT,
};
