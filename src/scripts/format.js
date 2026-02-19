import { parsePhoneNumber } from "awesome-phonenumber";
import { phone as phone_standard } from "phone";
import { phone as phoneValidator } from "@/scripts/validation";
import moment from "moment";
import { StateList } from "@/scripts/countries/states";

/* Use this function for display values */
export const phone_format = (number, countryCode) => {
  if (number) {
    const [a, b] = [
      parsePhoneNumber(number),
      parsePhoneNumber(number, {
        regionCode: countryCode ? countryCode : "US",
      }),
    ];
    const phoneNumber = a.valid ? a : b;
    if (phoneNumber && phoneNumber.countryCode !== 1) {
      return `${phoneNumber.number.international}`;
    }
    if (phoneNumber?.number?.national) {
      return `+${phoneNumber.countryCode} ${phoneNumber?.number?.national}`;
    }
  }
  return number;
};

export const formatPhone = (number) => {
  const phoneObj = phone_standard(number);
  const { phoneNumber, countryCode } = phoneObj;
  const numWithoutCountryCode = phoneNumber?.replace(countryCode, "");
  if (phoneNumber?.length > 0) {
    return `${countryCode} (${numWithoutCountryCode.slice(
      0,
      3
    )}) ${numWithoutCountryCode.slice(3, 6)}-${numWithoutCountryCode.slice(
      6,
      10
    )}`;
  }
  return number;
};

/* Use this when we need to create a phone payload object for API calls */
export const phone_package = (number, country) => {
  const phoneNumber = parsePhoneNumber(number, { regionCode: country });
  const extension = phoneNumber.ext;
  const phone = phoneNumber.number.e164;
  const code = phoneNumber.countryCode;
  return {
    phone_type: "phone",
    country_code: code,
    phone_number: phone.split(" ").join(""),
    extension: extension,
  };
};

export const urlDisplay = (web_url) => {
  const removedPretext = web_url.replace(
    /^(?:https?:\/\/)?(?:www\.)?(?:\/.)?/i,
    ""
  );
  const removedSlash = removedPretext.split("/")[0];
  const removedQuery = removedSlash.split("?")[0];
  return removedQuery;
};

export const standardizeUrl = (input) => {
  const sanitize = input.replace(/^(?:https:\/\/|http:\/\/|:\/\/|\/\/)/, "");
  const isHttp = input.match(/^http\b/);
  return isHttp ? `http://${sanitize}` : `https://${sanitize}`;
};

/* On mobile, urls get saved without http/https
This function allows us to open those urls on web
by prepending https if the url doesn't already contain it */
export const createValidUrl = (url) => {
  return !/^https?:\/\//i.test(url) && !/^http?:\/\//i.test(url)
    ? `https://${url}`
    : url;
};

export const getIdentityNickname = (identity) => {
  return (
    (identity && identity.nickname) ||
    (identity && identity.temp ? "" : "(Unnamed)")
  );
};

export const primary_field = (identity) => {
  let has_autofill = false;
  if (identity.stored_autofill) {
    has_autofill =
      identity.stored_autofill.email ||
      identity.stored_autofill.password ||
      identity.stored_autofill.phone;
  }
  if (identity.stored_password || has_autofill) {
    return "Login";
  }
  if (identity.cloaked_email) {
    return "Email";
  }
  if (identity.number_for_app || identity.number_for_personal) {
    return "Phone #";
  }
  return false;
};

export const convertHexToRgba = (color, opacity) => {
  color = color.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  if (opacity) {
    return "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
  }
  return "rgb(" + r + "," + g + "," + b + ")";
};

// Get first letter of first name / last name or username
export const getAccountInitials = (stringOne, stringTwo) => {
  if (stringOne && stringTwo) {
    return `${stringOne.charAt(0)}${stringTwo.charAt(0)}`;
  }
  return stringOne.charAt(0);
};

export const getAliasFromEmail = (email) => {
  return email && email.substring(0, email.indexOf("@"));
};

/*
Accepts sender_contact info, even if null

inferface senderContact = {
  first_name: string;
  last_name: string;
  // not using currently but this is a good future fallback
  original_name: string;
}

*/
export const getContactName = (senderContact) => {
  let firstName = "";
  let lastName = "";
  if (senderContact) {
    const { first_name, last_name } = senderContact;
    if (first_name && first_name.toLowerCase() !== "unknown") {
      firstName = first_name;
    }
    if (last_name && last_name.toLowerCase() !== "via cloaked") {
      lastName = last_name;
    }
  }
  return { firstName, lastName };
};

export const capitalizeFirstLetter = (string) => {
  return string?.charAt(0).toUpperCase() + string?.slice(1);
};

export const anonymPhone = (value) => {
  if (value && phoneValidator(value)) {
    let phone = phone_format(value) || value;
    phone = phone.replaceAll(/[^0-9()]/g, " ");
    return `+${phone.substring(0, phone.length - 4)} ****`;
  }
  return value;
};

export const getRelativeTime = (date) => {
  const incomingDate = moment(date);
  const today = moment().endOf("day");
  const tomorrow = moment().add(1, "day").endOf("day");
  return incomingDate < today
    ? "today"
    : incomingDate < tomorrow
      ? "tomorrow"
      : "";
};

export function highlight(text, highlight) {
  if (!highlight || !text) {
    return text;
  }
  let parts = highlight.split(" ").filter((f) => !!f.trim());
  // NOTE: supports matching words in title case, all caps, and lowercase
  // currently does not support mixed case matching like 90s aim chat
  // LiKe ThiS aS an ExAmPlE
  parts = [
    ...parts,
    ...parts.map((part) => part.toLowerCase()),
    ...parts.map((part) => part.toUpperCase()),
    ...parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)),
  ];
  parts.map((part) => {
    text = text.replaceAll(part, `**&_${part}_&**`);
  });
  text = text.replaceAll("**&_", "<span class='highlight-text'>");
  text = text.replaceAll("_&**", "</span>");
  return text;
}

export const formatPhoneStringBasic = (number) => {
  const phoneNumber = phone_standard(number);
  const check = phoneNumber.phoneNumber;
  if (check && check.length > 0) {
    return phoneNumber.phoneNumber;
  }
  return number;
};

const stateShorthands = StateList.map((state) => state.value);
export const formatAddress = (addressString) => {
  const addressParts = addressString.split(" ");
  const newAddressParts = addressParts.map((part) => {
    if (stateShorthands.includes(part.trim().toUpperCase())) {
      return part.trim().toUpperCase();
    } else {
      return part.trim().toLowerCase();
    }
  });

  return newAddressParts.join(" ");
};

export const formatNumbersBasedonLocale = (number) => {
  return new Intl.NumberFormat().format(number);
  // ex: 3500 > '3,500' if in US English locale
};

export const formatCardNumberField = (
  event,
  maxDigits = 16,
  gaps = [4, 8, 12]
) => {
  const input = event?.target;
  const raw = input?.value ?? "";
  const caret = input?.selectionStart ?? raw.length;

  const digits = raw.replace(/\D/g, "");
  const digitsBeforeCaret = raw.slice(0, caret).replace(/\D/g, "").length;
  const clampedDigits = digits.slice(0, maxDigits);

  // Format digits with gaps
  let formattedDigits = "";
  let lastGap = 0; // used to track where to start the next slice

  // clampedDigits.length used as last gap to ensure all digits are included
  for (const gap of [...gaps, clampedDigits.length]) {
    if (lastGap >= clampedDigits.length) break;

    const part = clampedDigits.slice(
      lastGap,
      Math.min(gap, clampedDigits.length)
    );
    if (!part) break;

    formattedDigits += (formattedDigits ? " " : "") + part;
    lastGap = gap;
  }

  // Restore caret position
  const clampedDigitsBeforeCaret = Math.min(
    digitsBeforeCaret,
    clampedDigits.length
  );

  const spacesBeforeCaret = gaps.filter(
    (gap) => gap <= clampedDigitsBeforeCaret
  ).length;

  const newCaret = Math.min(
    formattedDigits.length,
    clampedDigitsBeforeCaret + spacesBeforeCaret
  );

  if (input) {
    input.value = formattedDigits;
    input.setSelectionRange(newCaret, newCaret);
  }

  return formattedDigits;
};

export function formatCardExpiresAtField(event) {
  let value = event.target.value;
  value = value ? (value.match(/\d{1,2}/g) || []).join("/") : value;
  if (value.length === 2 && event.inputType === "insertText") {
    value += "/";
  }
  return value;
}

export function keyPressNumbersOnly(event) {
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}

export const format = {
  phone_format,
  phone_package,
  urlDisplay,
  standardizeUrl,
  createValidUrl,
  getIdentityNickname,
  primary_field,
  convertHexToRgba,
  getAccountInitials,
  getAliasFromEmail,
  getContactName,
  capitalizeFirstLetter,
  anonymPhone,
  getRelativeTime,
  highlight,
  formatPhoneStringBasic,
  formatAddress,
  formatNumbersBasedonLocale,
  formatPhone,
  formatCardNumberField,
  formatCardExpiresAtField,
  keyPressNumbersOnly,
};
