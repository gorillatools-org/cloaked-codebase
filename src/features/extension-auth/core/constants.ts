/**
 * Constants for Extension Authentication System
 */

export const SESSION_KEYS = {
  ALLOW_NAV: "allow_extension_auth_status_navigation",
} as const;

export const MESSAGE_TYPES = {
  IFRAME_READY: "extension-token-iframe-ready",
  ISSUE_TOKENS: "issue-extension-tokens",
  TOKEN_RESPONSE: "extension-token-response",
} as const;

export const DOM_ATTRIBUTES = {
  AUTH_IFRAME: "data-extension-auth-iframe",
  AUTH_CLOSE_BUTTON: "data-extension-auth-close",
} as const;

export const TIMEOUTS = {
  TOKEN_ISSUANCE: 15000, // 15 seconds
} as const;

export const ROUTES = {
  AUTH_STATUS: "/extension-auth-status",
} as const;

export const API_ENDPOINTS = {
  TOKEN_ISSUE: "auth/extension-token-issue/",
} as const;
