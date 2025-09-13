/**
 * Resource Cleanup for Extension Authentication System
 *
 * Handles cleanup of iframes, event listeners, and UI elements to prevent memory leaks.
 */

import { DOM_ATTRIBUTES } from "./constants";
import {
  getActiveIframe,
  getActiveMessageListener,
  getActiveCloseButton,
  clearAuthState,
} from "./state";

export const cleanupAuthResources = (debug: boolean = false): void => {
  const activeIframe = getActiveIframe();
  const activeMessageListener = getActiveMessageListener();
  const activeCloseButton = getActiveCloseButton();

  if (debug) {
    console.log(`[ExtensionAuth:DEBUG] Cleaning up auth resources:`, {
      hasActiveIframe: !!activeIframe,
      hasParentNode: !!activeIframe?.parentNode,
      hasMessageListener: !!activeMessageListener,
      hasCloseButton: !!activeCloseButton,
    });
    return;
  }

  // Clean up using module variables first
  if (activeIframe?.parentNode) {
    activeIframe.parentNode.removeChild(activeIframe);
  }

  if (activeCloseButton?.parentNode) {
    activeCloseButton.parentNode.removeChild(activeCloseButton);
  }

  if (activeMessageListener) {
    window.removeEventListener("message", activeMessageListener);
  }

  // Clear module state
  clearAuthState();

  // Fallback cleanup using DOM queries (in case module variables were lost after navigation)
  const remainingIframes = document.querySelectorAll(
    `iframe[${DOM_ATTRIBUTES.AUTH_IFRAME}]`
  );
  const remainingCloseButtons = document.querySelectorAll(
    `button[${DOM_ATTRIBUTES.AUTH_CLOSE_BUTTON}]`
  );

  remainingIframes.forEach((iframe) => {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  });

  remainingCloseButtons.forEach((button) => {
    if (button.parentNode) {
      button.parentNode.removeChild(button);
    }
  });
};
