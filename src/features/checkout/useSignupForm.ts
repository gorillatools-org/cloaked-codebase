import { ref } from "vue";

export type SignupType = "phone" | "email" | "username";

type SignupForm = {
  type: SignupType;
  phone: string;
  email: string;
  username: string;
  password: string;
};

export const useSignupForm = () =>
  ref<SignupForm>({
    type: "phone",
    phone: "",
    email: "",
    username: "",
    password: "",
  });
