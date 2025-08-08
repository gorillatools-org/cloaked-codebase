import { ref } from "vue";
import PhoneService from "@/api/actions/phone-service";

const phoneNumbers = ref([]);

export const useUserPhoneNumbers = () => {
  const fetch = async () => {
    const { data } = await PhoneService.getUserPhoneNumbers();
    phoneNumbers.value = data.results;
    return phoneNumbers.value;
  };

  return {
    phoneNumbers,
    fetch,
  };
};
