import { computed, ref } from "vue";
import store from "@/store";
import AuthService from "@/api/actions/auth-service";
import { authDecrypt, initiateEncryption } from "@/scripts/actions/encryption";
import {
  parseHeadlessUserError,
  useHeadlessIframe,
} from "@/features/headless-signup/useHeadlessIframe";
import type {
  HeadlessIframeRequests,
  LoginCredentials,
  SignupCredentials,
} from "@/features/headless-signup/types.ts";

const isPasswordlessLoginCredentials = (
  credentials: LoginCredentials
): credentials is HeadlessIframeRequests["login-passwordless-user"] =>
  !("password" in credentials) || !credentials.password;

const isPasswordlessSignupCredentials = (
  credentials: SignupCredentials
): credentials is HeadlessIframeRequests["register-passwordless-user"] =>
  !("password" in credentials) || !credentials.password;

export const useHeadlessUser = () => {
  const { mountIframe, codeVerifier, sendIframeRequest } = useHeadlessIframe();

  const headlessUser = computed(() => store.getters["authentication/user"]);
  const isHeadlessUserSubscribed = computed(
    () => store.getters["settings/isSubscribed"]
  );

  const isCreatingHeadlessUser = ref(false);
  const createHeadlessUserError = ref<string | null>(null);

  const isFetchingHeadlessUser = ref(false);
  const fetchHeadlessUserError = ref<string | null>(null);

  const isUpdatingHeadlessUser = ref(false);
  const updateHeadlessUserError = ref<string | null>(null);

  const isEncryptingHeadlessUser = ref(false);
  const encryptHeadlessUserError = ref<string | null>(null);

  const isVerifyingCode = ref(false);
  const verifyCodeError = ref<string | null>(null);

  const loginUserError = ref<string | null>(null);
  const loginCredentials = ref<LoginCredentials | null>(null);

  const createHeadlessUser = async ({
    captcha,
    phone_number,
  }: HeadlessIframeRequests["init-user"]) => {
    try {
      isCreatingHeadlessUser.value = true;
      createHeadlessUserError.value = null;

      const initUserResponse = await sendIframeRequest("init-user", {
        captcha,
        phone_number,
      });

      if (initUserResponse?.username_exists) {
        store.commit("authentication/updateUser", {
          credsFromOTP: {
            username: phone_number,
          },
        });
        return initUserResponse;
      }
      const authCode = await sendIframeRequest("request-code", null);

      const { data } = await store.dispatch("authentication/getAuthToken", {
        client_id: import.meta.env.VITE_HEADLESS_ID,
        codeVerifier: codeVerifier.value,
        payload: authCode,
      });

      await store.dispatch("authentication/setGuestToken", data);
    } catch (error) {
      createHeadlessUserError.value = parseHeadlessUserError(error);
    } finally {
      isCreatingHeadlessUser.value = false;
    }
  };

  const verifyCodeFromOTP = async ({
    phone_number,
    code,
  }: HeadlessIframeRequests["verify-phone-otp"]) => {
    isVerifyingCode.value = true;
    verifyCodeError.value = null;

    try {
      const verifyCodeResponse = await sendIframeRequest("verify-phone-otp", {
        phone_number,
        code,
      });

      if (verifyCodeResponse.existing_user) {
        store.commit("authentication/updateUser", {
          credsFromOTP: {
            username: phone_number,
          },
        });
      }
      return verifyCodeResponse;
    } catch (error) {
      verifyCodeError.value = parseHeadlessUserError(error);
    } finally {
      isVerifyingCode.value = false;
    }
  };

  const fetchHeadlessUser = async () => {
    try {
      isFetchingHeadlessUser.value = true;
      fetchHeadlessUserError.value = null;

      await store.dispatch("authentication/getUser");
    } catch (error) {
      fetchHeadlessUserError.value = parseHeadlessUserError(error);
    } finally {
      isFetchingHeadlessUser.value = false;
    }
  };

  const updateHeadlessUser = async (credentials: SignupCredentials) => {
    try {
      isUpdatingHeadlessUser.value = true;
      updateHeadlessUserError.value = null;

      if (isPasswordlessSignupCredentials(credentials)) {
        const { phone } = credentials;
        await sendIframeRequest("register-passwordless-user", { phone });
        loginCredentials.value = { phone };
      } else {
        const { username, password, email, phone } = credentials;

        const { salt } = await sendIframeRequest("register-user", {
          username,
          password,
          email,
          phone,
        });

        loginCredentials.value = { username, password, salt };
      }
    } catch (error) {
      updateHeadlessUserError.value = parseHeadlessUserError(error);
    } finally {
      isUpdatingHeadlessUser.value = false;
    }
  };

  const loginHeadlessUser = async () => {
    if (loginCredentials.value === null) {
      return;
    }

    let loginResponse;

    if (isPasswordlessLoginCredentials(loginCredentials.value)) {
      loginResponse = await sendIframeRequest("login-passwordless-user", {
        phone: loginCredentials.value.phone,
      });
      store.commit("authentication/setUsername", loginCredentials.value.phone);
    } else {
      loginResponse = await sendIframeRequest("login-user", {
        username: loginCredentials.value.username,
        password: loginCredentials.value.password,
        salt: loginCredentials.value.salt,
      });
      store.commit(
        "authentication/setUsername",
        loginCredentials.value?.username
      );
    }

    await store.dispatch("authentication/setAuthPayload", {
      client_id: import.meta.env.VITE_HEADLESS_ID,
      codeVerifier: codeVerifier.value,
      payload: loginResponse,
    });
    return loginResponse;
  };

  const encryptHeadlessUser = async () => {
    try {
      isEncryptingHeadlessUser.value = true;
      encryptHeadlessUserError.value = null;

      await initiateEncryption();
      const { data } = await AuthService.passPhrase();
      const { results } = data;
      return authDecrypt(results[0].key);
    } catch (error) {
      encryptHeadlessUserError.value = parseHeadlessUserError(error);
    } finally {
      isEncryptingHeadlessUser.value = false;
    }
  };

  const handleLoginPasswordlessUser = async ({
    phone,
  }: HeadlessIframeRequests["login-passwordless-user"]) => {
    try {
      const loginResponse = await sendIframeRequest("login-passwordless-user", {
        phone,
      });

      await store.dispatch("authentication/setAuthPayload", {
        client_id: import.meta.env.VITE_HEADLESS_ID,
        codeVerifier: codeVerifier.value,
        payload: loginResponse,
        username: phone,
        isLoggingIn: true,
      });

      return true;
    } catch (error) {
      loginUserError.value = parseHeadlessUserError(error);
    }
  };

  return {
    isCreatingHeadlessUser,
    createHeadlessUserError,
    createHeadlessUser,
    isFetchingHeadlessUser,
    fetchHeadlessUserError,
    fetchHeadlessUser,
    isUpdatingHeadlessUser,
    updateHeadlessUserError,
    updateHeadlessUser,
    isEncryptingHeadlessUser,
    encryptHeadlessUserError,
    encryptHeadlessUser,
    mountIframe,
    headlessUser,
    isHeadlessUserSubscribed,
    verifyCode: verifyCodeFromOTP,
    isVerifyingCode,
    verifyCodeError,
    handleLoginPasswordlessUser,
    loginUserError,
    loginHeadlessUser,
  };
};
