import { computed, ref } from "vue";
import store from "@/store";
import AuthService from "@/api/actions/auth-service";
import { authDecrypt, initiateEncryption } from "@/scripts/actions/encryption";
import {
  parseHeadlessSignupError,
  useHeadlessIframe,
} from "@/features/headless-signup/useHeadlessIframe";

export const useHeadlessUser = () => {
  const {
    iframeRef: headlessIframeRef,
    mountIframe: mountHeadlessIframe,
    codeVerifier,
    initUser,
    verifyPhone,
    requestCode,
    registerUser,
    loginUser,
    registerPasswordlessUser,
    loginPasswordlessUser,
  } = useHeadlessIframe();

  const headlessUser = computed(() => store.getters["authentication/user"]);
  const isHeadlessUserSubscribed = computed(
    () => store.getters["settings/isSubscribed"]
  );

  const isCreatingHeadlessUser = ref(false);
  const createHeadlessUserError = ref(null);

  const isFetchingHeadlessUser = ref(false);
  const fetchHeadlessUserError = ref(null);

  const isUpdatingHeadlessUser = ref(false);
  const updateHeadlessUserError = ref(null);

  const isEncryptingHeadlessUser = ref(false);
  const encryptHeadlessUserError = ref(null);

  const isVerifyingCode = ref(false);
  const verifyCodeError = ref(null);

  const loginUserError = ref(null);
  const loginCredentials = ref(null);

  const createHeadlessUser = async (cloudflareToken, phoneNumber) => {
    try {
      isCreatingHeadlessUser.value = true;
      createHeadlessUserError.value = null;

      const initUserPayload = { captcha: cloudflareToken };
      if (phoneNumber) {
        initUserPayload.phone_number = phoneNumber;
      }

      const initUserResponse = await initUser(initUserPayload);

      if (initUserResponse?.username_exists) {
        store.commit("authentication/updateUser", {
          credsFromOTP: {
            username: phoneNumber,
          },
        });
        return initUserResponse;
      }
      const authCode = await requestCode();

      const { data } = await store.dispatch("authentication/getAuthToken", {
        client_id: import.meta.env.VITE_HEADLESS_ID,
        codeVerifier: codeVerifier.value,
        payload: authCode,
      });

      await store.dispatch("authentication/setGuestToken", data);
    } catch (error) {
      createHeadlessUserError.value = parseHeadlessSignupError(error);
    } finally {
      isCreatingHeadlessUser.value = false;
    }
  };

  const verifyCodeFromOTP = async ({ phone_number, code }) => {
    isVerifyingCode.value = true;
    verifyCodeError.value = null;

    try {
      const verifyCodeResponse = await verifyPhone({
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
      verifyCodeError.value = parseHeadlessSignupError(error);
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
      fetchHeadlessUserError.value = error;
    } finally {
      isFetchingHeadlessUser.value = false;
    }
  };

  const updateHeadlessUser = async ({ username, password, email, phone }) => {
    try {
      isUpdatingHeadlessUser.value = true;
      updateHeadlessUserError.value = null;

      if (phone && !password) {
        await registerPasswordlessUser({ phone });
        loginCredentials.value = { phone, username };
      } else {
        const { salt } = await registerUser({
          username,
          password,
          email,
          phone,
        });
        const usernameToUse = username?.length
          ? username
          : phone?.length
            ? phone
            : email;
        loginCredentials.value = { username: usernameToUse, password, salt };
      }
    } catch (error) {
      updateHeadlessUserError.value = parseHeadlessSignupError(error);
    } finally {
      isUpdatingHeadlessUser.value = false;
    }
  };

  const loginHeadlessUser = async () => {
    let loginResponse;
    if (loginCredentials.value?.phone && !loginCredentials.value?.password) {
      loginResponse = await loginPasswordlessUser({
        phone: loginCredentials.value?.phone,
      });
      store.commit("authentication/setUsername", loginCredentials.value?.phone);
    } else {
      loginResponse = await loginUser(loginCredentials.value);
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
      encryptHeadlessUserError.value = error;
    } finally {
      isEncryptingHeadlessUser.value = false;
    }
  };

  const handleLoginPasswordlessUser = async ({ phone, code }) => {
    try {
      const loginResponse = await loginPasswordlessUser({
        phone,
        code,
      });

      await store.dispatch("authentication/setAuthPayload", {
        client_id: import.meta.env.VITE_HEADLESS_ID,
        codeVerifier: codeVerifier.value,
        payload: loginResponse,
        username: phone,
        isLoggingIn: true,
      });

      return true;

      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      loginUserError.value = "Error logging in, please try again.";
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
    headlessIframeRef,
    mountHeadlessIframe,
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
