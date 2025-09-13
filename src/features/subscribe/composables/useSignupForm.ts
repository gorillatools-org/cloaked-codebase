import { ref } from "vue";
import { toValue } from "@vueuse/core";

export const useSignupForm = ({
  defaultType = "phone",
  defaultPhone = "",
  defaultEmail = "",
  defaultUsername = "",
} = {}) => {
  const form = ref({
    type: toValue(defaultType),
    phone: toValue(defaultPhone),
    email: toValue(defaultEmail),
    username: toValue(defaultUsername),
    password: "",
  });

  return {
    form,
  };
};
