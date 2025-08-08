import { useDataDeleteSessionStorage } from "@/features/data-delete/composables/useDataDeleteSessionStorage.js";
import { capitalize, isArray, mergeWith, union } from "lodash-es";
import { formatPhoneStringBasic } from "@/scripts/format.js";
import PhoneService from "@/api/actions/phone-service.js";
import EmailService from "@/api/actions/email-service.js";
import DataDeleteService from "@/api/actions/data-delete-service.js";
import { toEnrollmentRequest } from "@/features/enrollment/data-utils.js";

const { readSearchProgressFromSessionStorage } = useDataDeleteSessionStorage();

export const useMonitoringAutofill = () => {
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

  const getAutofillDataFromUserObject = async () => {
    let userPhones = [];
    let userEmails = [];

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

  return {
    getAutofillDataFromSearchResults,
    getAutofillDataFromUserObject,
    getAutofillDataFromEnrollment,
    autofillMonitoringData,
  };
};
