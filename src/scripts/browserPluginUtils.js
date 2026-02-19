import { EXTENSION_STORE_URL } from "./constants";

/**
 * Opens the Cloaked browser extension store page in a centered popup window
 * @returns {Window} The window object of the opened popup
 */
export function openExtensionInstallPage() {
  const width = 1200;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    EXTENSION_STORE_URL,
    "_blank",
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,status=no`
  );
}
