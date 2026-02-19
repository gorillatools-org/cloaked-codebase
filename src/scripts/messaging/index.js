import { createMessaging } from "@/scripts/messaging/messaging";
import store from "@/store";
import {
  PH_FEATURE_FLAG_AI_OPERATOR,
  PH_FEATURE_FLAG_AUTO_CLOAKING,
} from "@/scripts/posthogEvents";
import { getPosthog } from "@/scripts/posthog";
import { EXTENSION_MESSAGE_TYPES } from "@/scripts/constants";

export const extensionMessaging = createMessaging({
  targetOrigin: window.location.origin,
  sourceId: "dashboard",
  callback: () => {
    store.dispatch("browser/savePluginDetected");
  },
});

const addExtensionAuthListener = () => {
  extensionMessaging.addListener((payload) => {
    if (payload.type === EXTENSION_MESSAGE_TYPES.EXTENSION_REQUESTED_TOKEN) {
      store.dispatch("authentication/initiateExtensionAuth", payload.data);
    }
  });
};

const addOperatorListener = async (sideEffect = () => {}) => {
  const posthog = await getPosthog();
  posthog.onFeatureFlags(async () => {
    extensionMessaging.addListener((payload) => {
      const operatorEnabled = posthog?.getFeatureFlag(
        PH_FEATURE_FLAG_AI_OPERATOR
      );
      const autoCloakingEnabled = posthog?.getFeatureFlag(
        PH_FEATURE_FLAG_AUTO_CLOAKING
      );
      if (
        payload.type ===
          EXTENSION_MESSAGE_TYPES.OPERATOR_DASHBOARD_LINK_RESPONSE &&
        payload.data &&
        operatorEnabled
      ) {
        store.dispatch("browser/saveOperatorDashboardLink", payload.data);
      }
      if (
        payload.type ===
          EXTENSION_MESSAGE_TYPES.AUTO_PASSWORD_CHANGE_URL_RESPONSE &&
        payload.data &&
        autoCloakingEnabled
      ) {
        store.dispatch("browser/saveAutoPasswordChangeUrl", payload.data);
      }
      sideEffect();
    });
  });
};

export const initializeExtensionMessaging = (() => {
  let listenersAdded = {
    operator: false,
    extensionAuth: false,
  };
  return async () => {
    if (!listenersAdded.extensionAuth) {
      addExtensionAuthListener();
      listenersAdded.extensionAuth = true;
    }

    if (!listenersAdded.operator) {
      addOperatorListener(() => {
        listenersAdded.operator = true;
      });
    }
  };
})();

export default extensionMessaging;
