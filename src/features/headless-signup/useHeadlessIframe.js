import { computed, ref } from "vue";
import { generatePkceRequirements } from "@/scripts/actions/auth";
import { headlessParams } from "@/api/api";
import { useRoute } from "vue-router";
import { useTrackingQueryParameters } from "@/composables/useTrackingQueryParameters";
import { toValue } from "@vueuse/core/index";

export const parseHeadlessSignupError = (error) => {
  if (error?.error_code === "invalid_username") {
    return "Username already exists";
  }
  return "Something went wrong. Please contact customer support and we'll resolve your issue.";
};

export const useHeadlessIframe = () => {
  const iframeRef = ref(null);

  const codeVerifier = ref(null);
  const codeChallenge = ref(null);

  const route = useRoute();
  const { withTrackingParams } = useTrackingQueryParameters();

  const iframeElement = computed(
    () => toValue(iframeRef)?.$el ?? toValue(iframeRef)
  );

  const mountIframe = async () => {
    const [verifier, challenge] = await generatePkceRequirements();
    codeVerifier.value = verifier;
    codeChallenge.value = challenge;

    const params = new URLSearchParams({
      cloaked_code_challenge: toValue(codeChallenge),
      cloaked_client_id: import.meta.env.VITE_HEADLESS_ID,
      secret: import.meta.env.VITE_SECRET,
      cloaked_redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      enable_delete: true,
      ...route.query,
      ...headlessParams(),
    });

    toValue(iframeElement).src = withTrackingParams(
      `${
        import.meta.env.VITE_API
      }auth/headless-create-user/?${params.toString()}`
    );

    await awaitIframeResponse((response) => response.event === "api-status");
  };

  const awaitIframeResponse = (isResponse) =>
    new Promise((resolve, reject) => {
      const responseListener = (message) => {
        if (isResponse(message.data)) {
          window.removeEventListener("message", responseListener);

          const response = message.data;
          if (response.data.status === "success") {
            resolve(response.data);
          } else {
            reject(response.data);
          }
        }
      };

      window.addEventListener("message", responseListener);
    });

  const sendIframeRequest = (event, payload = null) =>
    new Promise((resolve, reject) => {
      const requestId = self.crypto.randomUUID();

      try {
        awaitIframeResponse(
          (response) => response.metaData?.requestId === requestId
        )
          .then(resolve)
          .catch(reject);

        toValue(iframeElement)?.contentWindow?.postMessage(
          { event, data: payload, metaData: { requestId } },
          import.meta.env.VITE_API
        );
      } catch (error) {
        reject(error);
      }
    });

  const initUser = ({ captcha, phone_number }) =>
    sendIframeRequest("init-user", { captcha, phone_number });

  const requestCode = () => sendIframeRequest("request-code", null);

  const verifyPhone = ({ phone_number, code }) =>
    sendIframeRequest("verify-phone-otp", { phone_number, code });

  const registerUser = ({ username, password, email, phone }) =>
    sendIframeRequest("register-user", { username, password, email, phone });

  const loginUser = ({ username, password, salt }) =>
    sendIframeRequest("login-user", { username, password, salt });

  const registerPasswordlessUser = ({ phone }) =>
    sendIframeRequest("register-passwordless-user", { phone });

  const loginPasswordlessUser = ({ phone, code }) =>
    sendIframeRequest("login-passwordless-user", { phone, code });

  return {
    iframeRef,
    mountIframe,
    codeVerifier,
    codeChallenge,
    initUser,
    requestCode,
    registerUser,
    loginUser,
    registerPasswordlessUser,
    loginPasswordlessUser,
    verifyPhone,
  };
};
