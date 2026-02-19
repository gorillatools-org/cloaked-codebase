/**
 * Iframe Management for Extension Authentication System
 *
 * Handles iframe creation, styling, and event management for token issuance.
 */

import type { ExtensionAuthOptions, RouterInstance } from "./types";
import { DOM_ATTRIBUTES } from "./constants";
import { setActiveIframe, setActiveCloseButton } from "./state";
import { cleanupAuthResources } from "./cleanup";

export const createSimplifiedTokenIframe = (
  tokenIssueUrl: string,
  _router: RouterInstance,
  options: ExtensionAuthOptions = { silent: true, debug: false }
): void => {
  const { debug = false } = options;

  if (debug) {
    console.log(`[ExtensionAuth:SIMPLIFIED] Creating token issuance iframe:`, {
      url: tokenIssueUrl,
    });
  }

  const iframe = document.createElement("iframe");

  // Configure iframe for debug or production
  if (debug) {
    // Visible iframe for debugging
    iframe.style.position = "fixed";
    iframe.style.top = "60px";
    iframe.style.right = "10px";
    iframe.style.width = "800px";
    iframe.style.height = "600px";
    iframe.style.borderRadius = "8px";
    iframe.style.zIndex = "9999";
    iframe.style.backgroundColor = "white";
    iframe.style.border = "2px solid #28a745";
    iframe.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";

    // Create close button for debug mode
    const closeButton = createDebugCloseButton(debug);
    document.body.appendChild(closeButton);
    setActiveCloseButton(closeButton);

    // Set up iframe event listeners
    setupIframeEventListeners(iframe, debug);
  } else {
    // Hidden iframe for production
    iframe.style.display = "none";
  }

  // Configure iframe attributes
  iframe.src = tokenIssueUrl;
  iframe.setAttribute(DOM_ATTRIBUTES.AUTH_IFRAME, "true");

  // Add to DOM and update state
  document.body.appendChild(iframe);
  setActiveIframe(iframe);

  if (debug) {
    console.log(
      `[ExtensionAuth:SIMPLIFIED] Iframe created and appended to DOM`
    );
  }
};

const createDebugCloseButton = (debug: boolean): HTMLButtonElement => {
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "✕ Close Extension Token Iframe";
  closeButton.setAttribute(DOM_ATTRIBUTES.AUTH_CLOSE_BUTTON, "true");
  closeButton.style.position = "fixed";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.zIndex = "10000";
  closeButton.style.backgroundColor = "#28a745";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "6px";
  closeButton.style.padding = "8px 16px";
  closeButton.style.fontSize = "14px";
  closeButton.style.fontWeight = "bold";
  closeButton.style.cursor = "pointer";

  closeButton.addEventListener("click", () => {
    if (debug) {
      console.log(
        `[ExtensionAuth:SIMPLIFIED] Close button clicked, cleaning up`
      );
    }
    cleanupAuthResources(debug);
  });

  return closeButton;
};

const setupIframeEventListeners = (
  iframe: HTMLIFrameElement,
  debug: boolean
): void => {
  iframe.addEventListener("error", (error) => {
    console.error("[ExtensionAuth:SIMPLIFIED] Iframe loading error:", error);
  });

  iframe.addEventListener("load", () => {
    if (debug) {
      console.log(`[ExtensionAuth:SIMPLIFIED] Iframe loaded successfully`);
    }
  });
};
