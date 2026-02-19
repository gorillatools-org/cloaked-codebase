/**
 * State Management for Extension Authentication System
 *
 * Manages module-level state including active iframe, message listeners, and UI elements.
 */

import type { ExtensionAuthState } from "./types";

// Module-level state
let activeIframe: HTMLIFrameElement | null = null;
let activeMessageListener: ((_event: MessageEvent) => void) | null = null;
let activeCloseButton: HTMLButtonElement | null = null;

export const getAuthState = (): ExtensionAuthState => ({
  activeIframe,
  activeMessageListener,
  activeCloseButton,
});

export const setActiveIframe = (iframe: HTMLIFrameElement | null): void => {
  activeIframe = iframe;
};

export const getActiveIframe = (): HTMLIFrameElement | null => {
  return activeIframe;
};

export const setActiveMessageListener = (
  listener: ((_event: MessageEvent) => void) | null
): void => {
  activeMessageListener = listener;
};

export const getActiveMessageListener = ():
  | ((_event: MessageEvent) => void)
  | null => {
  return activeMessageListener;
};

export const setActiveCloseButton = (
  button: HTMLButtonElement | null
): void => {
  activeCloseButton = button;
};

export const getActiveCloseButton = (): HTMLButtonElement | null => {
  return activeCloseButton;
};

export const clearAuthState = (): void => {
  activeIframe = null;
  activeMessageListener = null;
  activeCloseButton = null;
};
