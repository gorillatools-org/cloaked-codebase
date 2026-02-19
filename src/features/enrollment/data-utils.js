import { formatPhoneStringBasic } from "@/scripts/format.js";
import { toValue } from "@vueuse/core";
import { isEqual } from "lodash-es";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_ENROLLMENT_DATA_AUTOFILL_ACCURACY } from "@/scripts/posthogEvents.js";

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

export const toApiPayloadMapped = (request) => {
  const newRequest = {};
  Object.keys(request).forEach((key) => {
    if (key === "name") {
      newRequest[key] = {
        first: toValue(request)?.name?.first || undefined,
        last: toValue(request)?.name?.last || undefined,
        middle: toValue(request)?.name?.middle || undefined,
        prefix: toValue(request)?.name?.prefix || undefined,
        suffix: toValue(request)?.name?.suffix || undefined,
      };
    }
    if (key === "other_names") {
      newRequest[key] = toValue(request)?.other_names || [];
    }

    if (key === "dob") {
      const [month, day, year] = (toValue(request)?.dob ?? "").split("-");
      newRequest[key] =
        year && month && day ? `${year}-${month}-${day}` : undefined;
    }

    if (key === "addresses") {
      newRequest[key] = toValue(request)?.addresses || [];
    }

    if (key === "email_addresses") {
      newRequest[key] = toValue(request)?.email_addresses || [];
    }

    if (key === "phone_numbers") {
      newRequest[key] =
        toValue(request)?.phone_numbers?.map(formatPhoneStringBasic) || [];
    }

    if (key === "ssn") {
      const ssnsValue = toValue(request)?.ssn?.split("-").join("") || null;
      newRequest.ssns = ssnsValue ? [ssnsValue] : [];
    }
  });
  return newRequest;
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

export const captureAutofillAccuracy = (autofill, payload) => {
  const autofilled = {
    firstName: !!autofill.name?.first,
    lastName: !!autofill.name?.last,
    dob: !!autofill.dob,
    ssn: !!autofill.ssn,
    email: !!autofill.email_addresses?.length,
    phone: !!autofill.phone_numbers?.length,
    addresses: false, // address autofill is not implemented
  };

  const updated = {
    firstName: (autofill.name?.first ?? "") !== (payload.name.first ?? ""),
    lastName: (autofill.name?.last ?? "") !== (payload.name.last ?? ""),
    dob: (autofill.dob ?? "") !== (payload.dob ?? ""),
    ssn: (autofill.ssn ?? "") !== (payload.ssn ?? ""),
    email: autofill.email_addresses?.[0] !== payload.email_addresses[0],
    phone: autofill.phone_numbers?.[0] !== payload.phone_numbers[0],
    addresses: !isEqual(autofill.addresses?.[0], payload.addresses[0]),
  };

  posthogCapture(PH_EVENT_ENROLLMENT_DATA_AUTOFILL_ACCURACY, {
    autofilled,
    updated,
  });
};
