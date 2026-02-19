/**
 * Token Issuance for Extension Authentication System
 *
 * Handles the main token issuance logic including iframe communication,
 * message handling, and timeout management.
 */

import store from "@/store";

import type {
  ExtensionAuthOptions,
  RouterInstance,
  TokenIssuanceResult,
  MessageEventData,
} from "./types";
import { MESSAGE_TYPES, TIMEOUTS, API_ENDPOINTS } from "./constants";
import { getActiveIframe, setActiveMessageListener } from "./state";
import { cleanupAuthResources } from "./cleanup";
import { createSimplifiedTokenIframe } from "./iframe";
import { storeExtensionTokens } from "./tokenStorage";

/**
 * Simplified extension token issuance using iframe and session authentication.
 *
 * This is a more streamlined approach that leverages the dashboard's existing
 * authentication session to issue extension tokens directly, without requiring
 * the complex OAuth flow.
 *
 * @param router Vue router instance
 * @param options Configuration options
 */
export const issueExtensionTokensViaIframe = async (
  router: RouterInstance,
  options: ExtensionAuthOptions = { silent: true, debug: false }
): Promise<TokenIssuanceResult> => {
  const { debug = false } = options;

  if (debug) {
    console.log(
      `[ExtensionAuth:SIMPLIFIED] Starting simplified extension token issuance:`,
      {
        options,
        currentUrl: window.location.href,
      }
    );
  }

  // Clean up any existing resources
  cleanupAuthResources(debug);

  try {
    // Environment already validated - using session authentication
    if (debug) {
      console.log(
        `[ExtensionAuth:SIMPLIFIED] Step 1: Using session authentication`
      );
    }

    if (debug) {
      console.log(
        `[ExtensionAuth:SIMPLIFIED] Step 2: Setting up iframe for token issuance - using backend settings`
      );
    }

    // Create the simplified iframe token issuance
    return await new Promise<TokenIssuanceResult>((resolve) => {
      let messageHandler: (_event: MessageEvent) => void;
      let timeoutId: ReturnType<typeof setTimeout>;

      // Create message handler for iframe communication
      messageHandler = (event: MessageEvent) => {
        handleIframeMessage(event, debug, resolve, messageHandler, timeoutId);
      };

      // Set up message listener
      window.addEventListener("message", messageHandler);
      setActiveMessageListener(messageHandler);

      // Set up timeout
      timeoutId = setTimeout(() => {
        handleTokenIssuanceTimeout(debug, messageHandler, resolve);
      }, TIMEOUTS.TOKEN_ISSUANCE);

      // Create iframe for extension token issuance
      const tokenIssueUrl = createTokenIssueUrl(debug);
      createSimplifiedTokenIframe(tokenIssueUrl, router, options);
    });
  } catch (err: any) {
    if (debug) {
      console.log(
        `[ExtensionAuth:SIMPLIFIED] Extension token issuance failed:`,
        {
          error: err,
          errorMessage: err?.message,
        }
      );
    }
    cleanupAuthResources(debug);
    throw err;
  }
};

const handleIframeMessage = (
  event: MessageEvent,
  debug: boolean,
  resolve: (_value: TokenIssuanceResult) => void,
  messageHandler: (_event: MessageEvent) => void,
  timeoutId: ReturnType<typeof setTimeout>
): void => {
  if (debug) {
    console.log(`[ExtensionAuth:SIMPLIFIED] Message received:`, {
      origin: event.origin,
      dataType: event.data?.type,
      success: event.data?.success,
      hasTokens: !!event.data?.tokens,
    });
  }

  const apiUrl = import.meta.env.VITE_API;
  if (!apiUrl) {
    console.error(
      "[ExtensionAuth] VITE_API environment variable is not defined"
    );
    return;
  }

  const expectedOrigin = new URL(apiUrl).origin;

  if (event.origin !== expectedOrigin) {
    if (debug) {
      console.log(
        `[ExtensionAuth:SIMPLIFIED] Message from wrong origin, ignoring`,
        event.origin,
        expectedOrigin
      );
    }
    return;
  }

  const data: MessageEventData = event.data;

  if (data.type === MESSAGE_TYPES.IFRAME_READY) {
    handleIframeReady(debug, expectedOrigin);
    return;
  }

  if (data.type === MESSAGE_TYPES.TOKEN_RESPONSE) {
    handleTokenResponse(data, debug, resolve, messageHandler, timeoutId);
  }
};

const handleIframeReady = (debug: boolean, expectedOrigin: string): void => {
  if (debug) {
    console.log(
      `[ExtensionAuth:SIMPLIFIED] Iframe ready, sending access token securely`
    );
  }

  // Get the user's access token from the Vuex store
  const accessToken = store.getters.auth_token;

  if (!accessToken) {
    console.error(
      "[ExtensionAuth] No access token available for extension token issuance"
    );
    return;
  }

  // Send token issuance request to iframe with access token
  // Extension client ID is now managed by the backend
  const activeIframe = getActiveIframe();
  if (activeIframe?.contentWindow) {
    activeIframe.contentWindow.postMessage(
      {
        type: MESSAGE_TYPES.ISSUE_TOKENS,
        accessToken: accessToken,
      },
      expectedOrigin
    );
  }
};

const handleTokenResponse = (
  data: MessageEventData,
  debug: boolean,
  resolve: (_value: TokenIssuanceResult) => void,
  messageHandler: (_event: MessageEvent) => void,
  timeoutId: ReturnType<typeof setTimeout>
): void => {
  if (debug) {
    console.log(`[ExtensionAuth:SIMPLIFIED] Token response received:`, {
      success: data.success,
      hasTokens: !!data.tokens,
      error: data.error,
    });
  }

  // Clean up
  clearTimeout(timeoutId);
  window.removeEventListener("message", messageHandler);
  cleanupAuthResources(debug);

  if (data.success && data.tokens) {
    // Store tokens in Vuex store
    storeExtensionTokens(data.tokens, debug)
      .then(() => {
        if (debug) {
          console.log(`[ExtensionAuth:SIMPLIFIED] Tokens stored successfully`);
        }
        resolve({ success: true, tokens: data.tokens });
      })
      .catch((error) => {
        console.error(
          "[ExtensionAuth:SIMPLIFIED] Failed to store tokens:",
          error
        );
        resolve({
          success: false,
          error: "Failed to store extension tokens",
        });
      });
  } else {
    const errorMsg = data.error || "Unknown error during token issuance";
    if (debug) {
      console.log(
        `[ExtensionAuth:SIMPLIFIED] Token issuance failed:`,
        errorMsg
      );
    }
    resolve({ success: false, error: errorMsg });
  }
};

const handleTokenIssuanceTimeout = (
  debug: boolean,
  messageHandler: (_event: MessageEvent) => void,
  resolve: (_value: TokenIssuanceResult) => void
): void => {
  if (debug) {
    console.log(`[ExtensionAuth:SIMPLIFIED] Token issuance timeout`);
  }
  window.removeEventListener("message", messageHandler);
  cleanupAuthResources(debug);
  resolve({ success: false, error: "Token issuance timeout" });
};

const createTokenIssueUrl = (debug: boolean): string => {
  const apiUrl = import.meta.env.VITE_API;
  if (!apiUrl) {
    throw new Error("VITE_API environment variable is not defined");
  }

  const tokenIssueUrl = new URL(`${apiUrl}${API_ENDPOINTS.TOKEN_ISSUE}`);

  // Extension client ID is now managed by the backend settings,
  // so we don't need to pass it in the URL
  // Access token will be passed securely via postMessage

  if (debug) {
    console.log(
      `[ExtensionAuth:SIMPLIFIED] Creating iframe with URL:`,
      tokenIssueUrl.toString()
    );
  }

  return tokenIssueUrl.toString();
};
