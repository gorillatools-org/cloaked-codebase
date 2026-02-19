/**
 * Token Storage for Extension Authentication System
 *
 * Handles storing extension tokens in Vuex store and broadcasting success to extension.
 */

import store from "@/store";
import type { ExtensionTokens } from "./types";

export const storeExtensionTokens = async (
  tokens: ExtensionTokens,
  debug: boolean = false
): Promise<void> => {
  if (debug) {
    console.log(`[ExtensionAuth:SIMPLIFIED] Storing extension tokens:`, {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      tokenType: tokens.token_type,
      scope: tokens.scope,
    });
  }

  // Store tokens in the same format as the existing extension auth
  store.commit("authentication/setExtensionAuth", {
    oauth: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
    },
  });

  // Broadcast success to extension
  try {
    await store.dispatch("authentication/broadcastExtensionAuthSuccess");
    if (debug) {
      console.log(
        `[ExtensionAuth:SIMPLIFIED] Extension auth success broadcasted`
      );
    }
  } catch (err) {
    if (debug) {
      console.log(
        `[ExtensionAuth:SIMPLIFIED] Failed to broadcast success:`,
        err
      );
    }
    // Don't fail the whole flow if broadcasting fails
  }

  if (debug) {
    console.log(`[ExtensionAuth:SIMPLIFIED] Tokens stored in Vuex store`);
  }
};
