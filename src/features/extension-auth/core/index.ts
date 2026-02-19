/**
 * Extension Authentication System - Main Entry Point
 *
 * This module handles simplified iframe-based authentication between the Cloaked web dashboard
 * and the browser extension. It provides a fast, secure authentication flow that leverages
 * the dashboard's existing session to issue extension tokens directly.
 *
 * ARCHITECTURAL FLOW:
 * ==================
 *
 * 1. INITIATION
 *    - Extension requests authentication via /extension-auth/issue or messaging system
 *    - Dashboard validates environment (extension installed, config present)
 *
 * 2. SIMPLIFIED IFRAME AUTHENTICATION
 *    - Hidden iframe is created pointing to backend extension token issuance endpoint
 *    - Backend validates user's dashboard session and extension client ID
 *    - Backend issues tokens directly without requiring OAuth flow
 *
 * 3. TOKEN DELIVERY
 *    - Iframe receives tokens and posts message to parent window
 *    - Parent window validates message origin and stores tokens in Vuex
 *    - Success is broadcasted to extension via messaging system
 *
 * 4. COMPLETION
 *    - Status page navigation (if not in silent mode)
 *    - Resources (iframe, listeners) are cleaned up
 *
 * SECURITY CONSIDERATIONS:
 * =======================
 *
 * - Session validation: Backend validates active dashboard authentication
 * - iframe isolation: Prevents direct access to authentication flow
 * - Origin validation: Messages only accepted from trusted sources
 * - Client validation: Extension client ID validated on backend
 * - Timeout handling: Prevents hung authentication flows
 * - Silent mode: Prevents UI disruption for background authentication
 *
 * MODES OF OPERATION:
 * ==================
 *
 * - Silent Mode: No UI shown, used for background token refresh
 * - Interactive Mode: Shows status pages, used for user-initiated auth
 * - Debug Mode: Visible iframe and detailed logging for development
 * - Error Handling: User-friendly error messages and graceful fallback
 *
 * @author @abhijay_cloaked (abhijay@cloaked.com)
 */

import type { ExtensionAuthOptions, RouterInstance } from "./types";
import { issueExtensionTokensViaIframe } from "./tokenIssuance";
import { navigateToStatusPage } from "./navigation";
import { cleanupAuthResources } from "./cleanup";

/**
 * Initialize extension authentication flow
 *
 * Main entry point for starting extension authentication using simplified
 * iframe-based token issuance with session authentication.
 *
 * @param router Vue router instance
 * @param options Configuration options
 */
export const initializeExtensionAuth = async (
  router: RouterInstance,
  options: ExtensionAuthOptions = { silent: true, debug: false }
): Promise<void> => {
  const { debug } = options;

  if (debug) {
    console.log(`[ExtensionAuth] Starting extension authentication:`, {
      options,
      currentUrl: window.location.href,
    });
  }

  // Clean up any existing resources
  cleanupAuthResources(debug);

  try {
    // Use simplified iframe approach for extension token issuance
    if (debug) {
      console.log(`[ExtensionAuth] Starting simplified iframe token issuance`);
    }

    const result = await issueExtensionTokensViaIframe(router, options);

    if (result.success) {
      if (debug) {
        console.log(`[ExtensionAuth] Extension authentication successful!`);
      }
      navigateToStatusPage(router, { success: "true" }, options);
      return;
    } else {
      const errorMsg = result.error || "Extension authentication failed";
      if (debug) {
        console.log(
          `[ExtensionAuth] Extension authentication failed:`,
          errorMsg
        );
      }
      navigateToStatusPage(router, { error: errorMsg }, options);
      throw new Error(errorMsg);
    }
  } catch (err: any) {
    if (debug) {
      console.log(`[ExtensionAuth] Extension authentication error:`, {
        error: err,
        errorMessage: err?.message,
      });
    }
    cleanupAuthResources(debug);

    const errorMsg = err?.message || "Extension authentication failed";
    navigateToStatusPage(router, { error: errorMsg }, options);
    throw err;
  }
};

// Re-export types for external use
export type { ExtensionAuthOptions, RouterInstance } from "./types";

// Re-export cleanup function for external use if needed
export { cleanupAuthResources } from "./cleanup";
