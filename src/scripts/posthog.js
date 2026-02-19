import posthog from "posthog-js";
import { POSTHOG_URL } from "@/scripts/constants";

const sensitiveParams = [
  "first_name",
  "last_name",
  "phone",
  "email",
  "state",
  "age",
  "city",
];

const removeSensitiveParams = (url) => {
  // short if no params are detected
  if (url.indexOf(`?`) == -1) {
    return url;
  }

  const urlObject = new URL(url);
  sensitiveParams.forEach((param) => {
    urlObject.searchParams.delete(param);
  });

  return urlObject.toString();
};

const sanitizePosthogProperties = (properties) => {
  if (properties["$current_url"]) {
    properties["$current_url"] = removeSensitiveParams(
      properties["$current_url"]
    );
  }

  return properties;
};

export const getPosthog = () =>
  new Promise((resolve) => {
    if (!window || !import.meta.env.VITE_POSTHOG_PROJECT_API_KEY) {
      return resolve(null);
    }

    if (window && window.$posthog) {
      return resolve(window.$posthog);
    }

    // Extract vid from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const distinctId = urlParams.get("vid");

    const posthogOptions = {
      api_host: import.meta.env.VITE_POSTHOG_API_HOST || POSTHOG_URL,
      autocapture: true,
      capture_pageleave: true,
      capture_pageview: true,
      disable_session_recording: false,
      enable_recording_console_log: false,
      mask_all_text: true, // dont leak user data
      mask_all_element_attributes: true, // dont leak user data
      opt_out_capturing_by_default: false,
      person_profiles: "always",
      sanitize_properties: sanitizePosthogProperties,
      loaded: (posthog) => {
        posthog.register({
          CloakedPlatform: "dashboard",
          CloakedAppVersion: import.meta.env.VITE_APP_VERSION,
        });
        resolve(posthog);
      },
    };
    if (distinctId) {
      posthogOptions.bootstrap = {
        ...posthogOptions.bootstrap,
        distinctID: distinctId,
      };
    }

    const $posthog = posthog.init(
      import.meta.env.VITE_POSTHOG_PROJECT_API_KEY,
      posthogOptions
    );

    window.$posthog = $posthog;
  });

export const posthogCapture = async (eventName, properties) => {
  const posthog = await getPosthog();
  if (posthog) {
    // eslint-disable-next-line no-restricted-properties
    posthog.capture(eventName, {
      ...properties,
      client_platform: "dashboard",
    });
  }
};
