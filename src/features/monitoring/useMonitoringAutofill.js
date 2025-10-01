import { useDataDeleteSessionStorage } from "@/features/data-delete/composables/useDataDeleteSessionStorage.js";
import { capitalize, isArray, mergeWith, union } from "lodash-es";
import { formatPhoneStringBasic } from "@/scripts/format.js";
import PhoneService from "@/api/actions/phone-service.js";
import EmailService from "@/api/actions/email-service.js";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import { toEnrollmentRequest } from "@/features/enrollment/data-utils.js";
import store from "@/store";
import {
  phone as isValidPhone,
  email as isValidEmail,
} from "@/scripts/validation.js";

const { readSearchProgressFromSessionStorage } = useDataDeleteSessionStorage();

export const useMonitoringAutofill = () => {
  const convertAddressLocalToObject = (address) => {
    return {
      address1: address.street || "",
      city: address.city || "",
      state: address.state?.abbreviation || "",
      postal_code: address.zip || "",
    };
  };

  const getAutofillDataFromSearchResults = async () => {
    const local = readSearchProgressFromSessionStorage();

    if (!local) {
      return null;
    }

    const { year, month, day } = local?.DOB || {};

    return {
      name: {
        first: capitalize(local?.firstName) || null,
        middle: capitalize(local?.middleName) || null,
        last: capitalize(local?.lastName) || null,
      },
      dob: year && month && day ? `${month}-${day}-${year}` : null,
      email_addresses: local?.emails || [],
      phone_numbers: formatPhoneStringBasic(local?.phone)
        ? [formatPhoneStringBasic(local?.phone)]
        : [],
    };
  };

  const getAutofillDataFromSearchResultsV2 = async () => {
    const local = readSearchProgressFromSessionStorage();

    if (!local) {
      return null;
    }

    const { year, month, day } = local?.DOB || {};

    const phoneNumbers = [];
    if (local?.phone) {
      phoneNumbers.push(formatPhoneStringBasic(local?.phone));
    }
    if (local?.phones) {
      local.phones.forEach((phone) => {
        phoneNumbers.push(formatPhoneStringBasic(phone));
      });
    }

    return {
      name: {
        first: capitalize(local?.firstName) || null,
        middle: capitalize(local?.middleName) || null,
        last: capitalize(local?.lastName) || null,
      },
      dob: year && month && day ? `${month}-${day}-${year}` : null,
      email_addresses: local?.emails || [],
      phone_numbers: phoneNumbers,
      addresses:
        local?.locations?.map((location) =>
          convertAddressLocalToObject(location)
        ) || [],
    };
  };

  const getAutofillDataFromUserObject = async () => {
    let userPhones = [];
    let userEmails = [];
    const username = store.getters["authentication/getUsername"];

    try {
      const [userPhonesData, userEmailsData] = await Promise.all([
        PhoneService.getUserPhoneNumbers(),
        EmailService.getUserEmails(),
      ]);

      userPhones =
        userPhonesData?.data?.results?.map((phone) =>
          formatPhoneStringBasic(phone.phone_number)
        ) ?? [];

      userEmails =
        userEmailsData?.data?.results?.map((email) => email.email) ?? [];

      if (isValidPhone(username)) {
        userPhones.push(username);
      }

      if (isValidEmail(username)) {
        userEmails.push(username);
      }
    } catch (error) {
      console.error(error);
    }

    return {
      email_addresses: userEmails,
      phone_numbers: userPhones,
    };
  };

  const getAutofillDataFromEnrollment = async () => {
    try {
      const response = await DataDeleteService.getEnrollmentProfile();

      const enrollment = response?.data;

      if (!enrollment) {
        return null;
      }

      return toEnrollmentRequest(enrollment);
    } catch {
      return null;
    }
  };

  const autofillMonitoringData = (request, data) => {
    mergeWith(request.value, data, (objValue, srcValue) => {
      if (isArray(objValue)) {
        return union(objValue, srcValue);
      }
    });
  };

  const combineAutofillData = (currData, newData) => {
    mergeWith(currData, newData, (objValue, srcValue) => {
      if (isArray(objValue)) {
        return union(objValue, srcValue);
      }
    });
    return currData;
  };

  return {
    getAutofillDataFromSearchResults,
    getAutofillDataFromSearchResultsV2,
    getAutofillDataFromUserObject,
    getAutofillDataFromEnrollment,
    autofillMonitoringData,
    combineAutofillData,
  };
};
