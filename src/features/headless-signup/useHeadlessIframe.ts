import {
  type ComponentPublicInstance,
  computed,
  ref,
  useTemplateRef,
} from "vue";
import { generatePkceRequirements } from "@/scripts/actions/auth";
import { headlessParams } from "@/api/api";
import { useRoute } from "vue-router";
import { useTrackingQueryParameters } from "@/composables/useTrackingQueryParameters";
import { toValue } from "@vueuse/core";
import { PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT } from "@/scripts/posthogEvents";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag";
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

const isSuccessResponse = <Event extends { status: IframeResponseStatus }>(
  data: Event
): data is SuccessResponse<Event> => data.status === "success";

export const parseHeadlessUserError = (error: unknown) => {
  if (isHeadlessIframeError(error) && error.error_code === "invalid_username") {
    return "Username already exists";
  }
  return "Something went wrong. Please try again later.";
};

export const useHeadlessIframe = () => {
  const iframeRef = useTemplateRef<
    HTMLIFrameElement | ComponentPublicInstance<HTMLIFrameElement>
  >("headlessIframeRef");

  const codeVerifier = ref<string | null>(null);
  const codeChallenge = ref<string | null>(null);

  const route = useRoute();
  const { withTrackingParams } = useTrackingQueryParameters();

  const iframeElement = computed<HTMLIFrameElement>(() => {
    const iframe = toValue(iframeRef);
    return iframe !== null && "$el" in iframe ? iframe.$el : iframe;
  });

  const mountIframe = async () => {
    const [verifier, challenge] = await generatePkceRequirements();
    codeVerifier.value = verifier;
    codeChallenge.value = challenge;

    const { value: featureFlagValue } = await fetchFeatureFlag(
      PH_FEATURE_FLAG_TOP_OF_FUNNEL_EXPERIMENT
    );

    const params = new URLSearchParams({
      cloaked_code_challenge: toValue(codeChallenge) ?? "",
      cloaked_client_id: import.meta.env.VITE_HEADLESS_ID ?? "",
      secret: import.meta.env.VITE_SECRET ?? "",
      cloaked_redirect_uri: import.meta.env.VITE_REDIRECT_URI ?? "",
      enable_delete: "true",
      ...route.query,
      ...headlessParams(),
    });

    if (featureFlagValue === "checkout-feature-vpn") {
      params.append("vpn_customer", "true");
    }

    toValue(iframeElement).src = withTrackingParams(
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

        toValue(iframeElement)?.contentWindow?.postMessage(
          request,
          import.meta.env.VITE_API ?? ""
        );
      } catch (error) {
        reject(error);
      }
    });

  return {
    iframeRef,
    mountIframe,
    codeVerifier,
    codeChallenge,
    sendIframeRequest,
  };
};
