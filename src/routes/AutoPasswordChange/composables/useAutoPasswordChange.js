import { computed, watch } from "vue";
import store from "@/store";
import { HAS_ACTIVATED_PLUGIN } from "@/scripts/userFlags";
import { extensionMessaging } from "@/scripts/messaging";
import { initializeExtensionMessaging } from "@/scripts/messaging";
import { DOWNLOAD_APP_URL } from "@/scripts/constants";

export const useAutoPasswordChange = () => {
  const extensionInstalled = computed(() => {
    return (
      store.getters.getFlag(HAS_ACTIVATED_PLUGIN) ||
      store.getters["browser/pluginDetected"]
    );
  });

  const autoPasswordChangeUrl = computed(() => {
    return store.getters["browser/autoPasswordChangeUrl"];
  });

  watch(extensionInstalled, (installed) => {
    if (installed && !autoPasswordChangeUrl.value) {
      try {
        requestAutoPasswordChangeUrl();
      } catch (error) {
        console.error("Error requesting auto password change URL", error);
      }
    }
  });

  const requestAutoPasswordChangeUrl = () => {
    try {
      initializeExtensionMessaging().then(() => {
        extensionMessaging?.sendMessage?.({
          type: "AUTO_PASSWORD_CHANGE_URL_REQUEST",
        });
      });
    } catch (error) {
      console.error("Error requesting auto password change URL", error);
    }
  };

  const openExtensionInstallPage = () => {
    const width = 1200;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    return window.open(
      DOWNLOAD_APP_URL,
      "_blank",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,status=no`
    );
  };

  return {
    extensionInstalled,
    autoPasswordChangeUrl,
    openExtensionInstallPage,
    requestAutoPasswordChangeUrl,
  };
};
