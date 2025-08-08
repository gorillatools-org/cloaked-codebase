import { createMessaging } from "@/scripts/messaging/messaging";
import store from "@/store";
import {
  PH_FEATURE_FLAG_AI_OPERATOR,
  PH_FEATURE_FLAG_AUTO_CLOAKING,
} from "@/scripts/posthogEvents";
import { getPosthog } from "@/scripts/posthog";
export const extensionMessaging = createMessaging({
  targetOrigin: window.location.origin,
  sourceId: "dashboard",
  callback: () => {
    store.dispatch("browser/savePluginDetected");
  },
});

export const initializeExtensionMessaging = (() => {
  let listenerAdded = false; // Private variable
  return async () => {
    if (!listenerAdded) {
      const posthog = await getPosthog();
      posthog.onFeatureFlags(() => {
        extensionMessaging.addListener((payload) => {
          const operatorEnabled = posthog?.getFeatureFlag(
            PH_FEATURE_FLAG_AI_OPERATOR
          );
          const autoCloakingEnabled = posthog?.getFeatureFlag(
            PH_FEATURE_FLAG_AUTO_CLOAKING
          );
          if (
            payload.type === "OPERATOR_DASHBOARD_LINK_RESPONSE" &&
            payload.data &&
            operatorEnabled
          ) {
            store.dispatch("browser/saveOperatorDashboardLink", payload.data);
          }
          if (
            payload.type === "AUTO_PASSWORD_CHANGE_URL_RESPONSE" &&
            payload.data &&
            autoCloakingEnabled
          ) {
            store.dispatch("browser/saveAutoPasswordChangeUrl", payload.data);
          }
        });
        listenerAdded = true;
      });
    }
  };
})();

export default extensionMessaging;
