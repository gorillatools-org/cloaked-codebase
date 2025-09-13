// urls
import { FILE_PERMISSIONS } from "@/scripts/constants";

export const urlCheck =
  /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
export const urlNotFirstPage = /page=[2-9]/i;

// search
export const beginningOfEveryWord = (query) => {
  // replace anything that's not a lower/uppercase letter, period, dash, or underscore with a boundary

  const updated = query.replace(/[^a-zA-Z0-9.@\-_/\s]+/g);
  return new RegExp(updated, "ig");
};
export const matchInWord = (query) => {
  const updated = query.replace(/[^a-zA-Z0-9.@\-_]+/g);
  return new RegExp(`(${updated})`, "ig");
};

export const isTypeBanned = (mime, name) => {
  const bannedTypes = FILE_PERMISSIONS.BANNED.map((type) => {
    const [ext, mime] = type.split(":");
    return {
      ext: ext.trim(),
      mime: mime.trim(),
    };
  });
  const ext = name.split(".").pop();
  return bannedTypes.find((f) => {
    return f.mime === mime || f.ext === `.${ext}`;
  });
};

export const emailCheck = (email) => {
  // eslint-disable-next-line no-control-regex
  return /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:\\[\x00-\x7F]|[^\x22\\])*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)$/.test(
    email
  );
};

export const nameCheck = (name) => {
  // eslint-disable-next-line no-control-regex
  return /^[^\x00-\x1F!-&(-,/:-@[-_\x7B-\x7F]{1,100}$/.test(name);
};

export const personalNameCheck = (name) => {
  return /^[a-zA-Z\u0080-\u024F\u1E00-\u1EFF\s.'\u2019-]{1,100}$/.test(name);
};

export const isAndroid =
  typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

export const codeCheck = (code) => {
  return !!code && code?.match(/[0-9]{6}/i);
};
/* The regex patterns below are primarily used/* The regex patterns below are used for Array-related data validation.
   These patterns must match what the backend expects for compatibility.
   Do not modify these without coordinating with the backend team,
   as changes would be breaking. */
// Address validation regex patterns
export const addressNameCheck = (name) => {
  return /^[a-zA-Z\u0080-\u024F\u1E00-\u1EFF\s.-]{1,100}$/.test(name);
};

export const addressStreetCheck = (address) => {
  return /^[a-zA-Z0-9\u0080-\u024F\u1E00-\u1EFF\s.,#'\u2019/-]{1,100}$/.test(
    address
  );
};

export const postalCodeCheck = (postalCode) => {
  return /^((\d{5}-\d{4})|(\d{5})|([A-Z]\d[A-Z]\s?\d[A-Z]\d))$/.test(
    postalCode
  );
};

export const cityCheck = (city) => {
  return /^[a-zA-Z\u0080-\u024F\s.'\u2019-]{1,100}$/.test(city);
};

export const stateCheck = (state) => {
  return /^[\w-]{2,10}$/.test(state);
};

export const countryCodeCheck = (country) => {
  return /^[a-zA-Z]{2}$/.test(country);
};

export const regex = {
  urlCheck,
  urlNotFirstPage,
  beginningOfEveryWord,
  matchInWord,
  isTypeBanned,
  emailCheck,
  nameCheck,
  personalNameCheck,
  isAndroid,
  codeCheck,
  addressNameCheck,
  addressStreetCheck,
  postalCodeCheck,
  cityCheck,
  stateCheck,
  countryCodeCheck,
};
