import { formatPhoneStringBasic } from "@/scripts/format.js";
import { toValue } from "@vueuse/core";

export const toApiPayload = (request) => {
  const [month, day, year] = (toValue(request)?.dob ?? "").split("-");
  const ssn = toValue(request)?.ssn?.split("-").join("") || null;

  return {
    name: {
      first: toValue(request)?.name?.first || undefined,
      last: toValue(request)?.name?.last || undefined,
      middle: toValue(request)?.name?.middle || undefined,
      prefix: toValue(request)?.name?.prefix || undefined,
      suffix: toValue(request)?.name?.suffix || undefined,
    },
    other_names: toValue(request)?.other_names || [],
    dob: year && month && day ? `${year}-${month}-${day}` : undefined,
    birth_year: toValue(request)?.dob?.split("-").pop() || undefined, // to be deprecated
    addresses: toValue(request)?.addresses || [],
    email_addresses: toValue(request)?.email_addresses || [],
    phone_numbers:
      toValue(request)?.phone_numbers?.map(formatPhoneStringBasic) || [],
    ssns: ssn ? [ssn] : [],
  };
};

export const toEnrollmentRequest = (apiResponse) => {
  const [year, month, day] = (apiResponse?.dob ?? "").split("-");

  return {
    name: {
      first: apiResponse?.name?.first ?? null,
      middle: apiResponse?.name?.middle ?? null,
      last: apiResponse?.name?.last ?? null,
      prefix: apiResponse?.name?.prefix ?? null,
      suffix: apiResponse?.name?.suffix ?? null,
    },
    other_names: apiResponse?.other_names ?? [],
    dob: year && month && day ? `${month}-${day}-${year}` : null,
    addresses: apiResponse?.addresses ?? [],
    email_addresses: apiResponse?.email_addresses ?? [],
    phone_numbers: apiResponse?.phone_numbers ?? [],
    ssn_submitted: apiResponse?.ssn_submitted,
  };
};
