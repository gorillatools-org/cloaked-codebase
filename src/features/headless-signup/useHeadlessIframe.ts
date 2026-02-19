import { ref, type TemplateRef } from "vue";
import { generatePkceRequirements } from "@/scripts/actions/auth";
import { headlessParams } from "@/api/api";
import { useRoute } from "vue-router";
import { useTrackingQueryParameters } from "@/composables/useTrackingQueryParameters";
import { toValue } from "@vueuse/core";
import {
  type IframeResponseStatus,
  type HeadlessIframeResponses,
  type HeadlessIframeResponseMessage,
  type HeadlessIframeRequests,
  type HeadlessIframeRequestMessage,
  type HeadlessIframeRequestToResponseMap,
  type SuccessResponse,
} from "./types.ts";

const isHeadlessIframeError = (
  error: unknown
): error is { error_code: string } =>
  typeof error === "object" && error !== null && "error_code" in error;

const isHeadlessIframeErrorWithMessage = (
  error: unknown
): error is { error_message: string } =>
  typeof error === "object" &&
  error !== null &&
  "error_message" in error &&
  typeof error.error_message === "string";

const isSuccessResponse = <Event extends { status: IframeResponseStatus }>(
  data: Event
): data is SuccessResponse<Event> => data.status === "success";

export const parseHeadlessUserError = (
  error: unknown,
  shouldShowServerErrorMessage: boolean = false
) => {
  if (isHeadlessIframeError(error) && error.error_code === "invalid_username") {
    return "Username already exists";
  }

  if (shouldShowServerErrorMessage && isHeadlessIframeErrorWithMessage(error)) {
    return error.error_message;
  }

  return "Something went wrong. Please try again later.";
};

export const useHeadlessIframe = () => {
  const codeVerifier = ref<string | null>(null);
  const codeChallenge = ref<string | null>(null);
  const iframe = ref<HTMLIFrameElement | null>(null);

  const route = useRoute();
  const { withTrackingParams } = useTrackingQueryParameters();

  const mountIframe = async (elementRef: TemplateRef<HTMLIFrameElement>) => {
    const element = toValue(elementRef);

    if (!element) {
      return;
    }

    iframe.value = element;

    const [verifier, challenge] = await generatePkceRequirements();
    codeVerifier.value = verifier;
    codeChallenge.value = challenge;

    // NOTE: backend will generate fresh posthog uuid
    const queryCopy = { ...route.query };
    delete queryCopy.vid;

    const params = new URLSearchParams({
      cloaked_code_challenge: toValue(codeChallenge) ?? "",
      cloaked_client_id: import.meta.env.VITE_HEADLESS_ID ?? "",
      secret: import.meta.env.VITE_SECRET ?? "",
      cloaked_redirect_uri: import.meta.env.VITE_REDIRECT_URI ?? "",
      enable_delete: "true",
      vpn_customer: "true",
      ...queryCopy,
      ...headlessParams(),
    });

    element.src = withTrackingParams(
      `${
        import.meta.env.VITE_API
      }auth/headless-create-user/?${params.toString()}`
    );

    await awaitIframeResponse((response) => response.event === "api-status");
  };

  const awaitIframeResponse = <Event extends keyof HeadlessIframeResponses>(
    isResponse: (response: HeadlessIframeResponseMessage<Event>) => boolean
  ): Promise<SuccessResponse<HeadlessIframeResponses[Event]>> =>
    new Promise((resolve, reject) => {
      const responseListener = (
        message: MessageEvent<HeadlessIframeResponseMessage<Event>>
      ) => {
        if (isResponse(message.data)) {
          window.removeEventListener("message", responseListener);

          const response = message.data;
          if (isSuccessResponse(response.data)) {
            resolve(response.data);
          } else {
            reject(response.data);
          }
        }
      };

      window.addEventListener("message", responseListener);
    });

  const sendIframeRequest = <Event extends keyof HeadlessIframeRequests>(
    event: Event,
    payload: HeadlessIframeRequests[Event]
  ): Promise<
    SuccessResponse<
      HeadlessIframeResponses[HeadlessIframeRequestToResponseMap[Event]]
    >
  > =>
    new Promise((resolve, reject) => {
      const requestId = self.crypto.randomUUID();

      try {
        awaitIframeResponse<HeadlessIframeRequestToResponseMap[Event]>(
          (response) => response.metaData?.requestId === requestId
        )
          .then(resolve)
          .catch(reject);

        const request: HeadlessIframeRequestMessage<Event> = {
          event,
          data: payload,
          metaData: { requestId },
        };

        toValue(iframe)?.contentWindow?.postMessage(
          request,
          import.meta.env.VITE_API ?? ""
        );
      } catch (error) {
        reject(error);
      }
    });

  return {
    mountIframe,
    codeVerifier,
    codeChallenge,
    sendIframeRequest,
  };
};
