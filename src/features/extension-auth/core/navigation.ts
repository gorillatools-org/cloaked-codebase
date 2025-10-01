/**
 * Navigation Management for Extension Authentication System
 *
 * Handles status page navigation and routing logic.
 */

import type {
  ExtensionAuthOptions,
  NavigationQuery,
  RouterInstance,
} from "./types";
import { SESSION_KEYS, ROUTES } from "./constants";

export const navigateToStatusPage = (
  router: RouterInstance,
  query: NavigationQuery,
  options: ExtensionAuthOptions = { silent: true, debug: false }
): void => {
  const { silent = true, debug = false } = options;

  if (debug) {
    console.log(`[ExtensionAuth:DEBUG] navigateToStatusPage called:`, {
      query,
      silent,
      debug,
      currentPath: router.currentRoute.value.path,
      stack: new Error().stack,
    });
  }

  if (silent) {
    if (debug) {
      console.log(
        `[ExtensionAuth:DEBUG] Navigation skipped due to silent mode`
      );
    }
    return;
  }

  if (debug) {
    console.log(
      `[ExtensionAuth:DEBUG] Setting navigation session key and navigating to status page`
    );
  }

  sessionStorage.setItem(SESSION_KEYS.ALLOW_NAV, "true");
  router.replace({ path: ROUTES.AUTH_STATUS, query });
};
