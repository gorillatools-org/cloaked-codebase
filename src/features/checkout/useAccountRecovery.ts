import { ref } from "vue";

export type AccountRecovery = {
  username: string | null;
  password: string | null;
  recovery: string | null;
};

export const useAccountRecovery = () => {
  return ref<AccountRecovery>({
    username: null,
    password: null,
    recovery: null,
  });
};
