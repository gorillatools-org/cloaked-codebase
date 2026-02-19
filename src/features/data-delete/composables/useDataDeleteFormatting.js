import { formatPhone } from "@/scripts/format";
import { phone } from "phone";
import { computed } from "vue";

export const useDataDeleteFormatting = (dataDeleteInputForm) => {
  const formattedPhoneNumber =
    phone(dataDeleteInputForm.value.phone).phoneNumber ||
    dataDeleteInputForm.value.phone;

  const formattedUserName = computed(() => {
    if (
      dataDeleteInputForm.value.firstName &&
      dataDeleteInputForm.value.lastName
    ) {
      const fullName = `${dataDeleteInputForm.value.firstName} ${dataDeleteInputForm.value.lastName}`;
      if (!dataDeleteInputForm.value.state) return fullName;
      return `${fullName} in ${dataDeleteInputForm.value.state}`;
    } else if (phone(dataDeleteInputForm.value.phone).isValid) {
      return formatPhone(dataDeleteInputForm.value.phone);
    } else {
      return dataDeleteInputForm.value.phone;
    }
  });

  return {
    formattedPhoneNumber,
    formattedUserName,
  };
};
