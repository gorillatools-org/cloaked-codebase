import { useSessionStorage } from "@vueuse/core";

export const useSessionEnrollmentData = () => {
  const enrollmentData = useSessionStorage("temp-enrollment-data", {
    name: {
      first: null,
      last: null,
    },
    dob: null,
    addresses: null,
    email_addresses: null,
    phone_numbers: null,
    ssn: null,
  });

  const saveEnrollmentData = (data) => (enrollmentData.value = data);

  return {
    enrollmentData,
    saveEnrollmentData,
  };
};
