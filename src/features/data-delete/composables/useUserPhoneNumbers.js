import { ref } from "vue";
import PhoneService from "@/api/actions/phone-service";

/**
 * @typedef {import('@/types/user').UserPhone} UserPhone
 * @typedef {import('vue').Ref<UserPhone[]>} UserPhoneRef
 */
/** @type {UserPhoneRef} */
const phoneNumbers = ref([]);

export const useUserPhoneNumbers = () => {
  /** @returns {Promise<UserPhone[]>} */
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
