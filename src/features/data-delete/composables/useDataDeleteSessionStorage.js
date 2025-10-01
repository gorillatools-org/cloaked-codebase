import { phone } from "phone";
import { formatPhone } from "@/scripts/format";

const DATA_DELETE_SESSION_STORAGE_KEY = "data-delete";

export const useDataDeleteSessionStorage = (
  dataDeleteInputForm,
  searchResults
) => {
  const clearSearchProgressFromSessionStorage = () => {
    sessionStorage.removeItem(DATA_DELETE_SESSION_STORAGE_KEY);
  };

  const saveSearchProgressToSessionStorage = () => {
    const dataDeleteSessionData = searchResults?.value?.[0] ?? {};

    if (phone(dataDeleteInputForm.value.phone).isValid) {
      dataDeleteSessionData.phone = formatPhone(
        dataDeleteInputForm.value.phone
      );
    }

    dataDeleteSessionData.firstName =
      dataDeleteInputForm.value.firstName || dataDeleteSessionData.firstName;
    dataDeleteSessionData.lastName =
      dataDeleteInputForm.value.lastName || dataDeleteSessionData.lastName;
    dataDeleteSessionData.age =
      dataDeleteInputForm.value.age || dataDeleteSessionData.age;
    dataDeleteSessionData.state = dataDeleteInputForm.value.state;
    dataDeleteSessionData.email = dataDeleteInputForm.value.email;
    dataDeleteSessionData.city = dataDeleteInputForm.value.city;

    sessionStorage.setItem(
      DATA_DELETE_SESSION_STORAGE_KEY,
      JSON.stringify(dataDeleteSessionData)
    );
  };

  const readSearchProgressFromSessionStorage = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem(DATA_DELETE_SESSION_STORAGE_KEY)
      );
    } catch {
      return null;
    }
  };

  return {
    clearSearchProgressFromSessionStorage,
    saveSearchProgressToSessionStorage,
    readSearchProgressFromSessionStorage,
  };
};
