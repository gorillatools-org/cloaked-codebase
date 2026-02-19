import { watch, onMounted } from "vue";
import { datadogRum } from "@datadog/browser-rum";
import store from "@/store";

export const useDatadogSessionReplay = () => {
  const updateSessionReplayState = (isEnabled) => {
    if (!import.meta.env.VITE_DATADOG_APP_ID) {
      return; // Datadog not configured
    }

    if (isEnabled) {
      datadogRum.startSessionReplayRecording();
    } else {
      datadogRum.stopSessionReplayRecording();
    }
  };

  onMounted(() => {
    // Set initial state based on user permission
    // Default to true if permission hasn't been set yet
    const isEnabled =
      store.getters["settings/getPermissions"]
        ?.permission_allow_session_replay ?? false;
    updateSessionReplayState(isEnabled);

    // Watch for changes to the permission
    watch(
      () =>
        store.getters["settings/getPermissions"]
          ?.permission_allow_session_replay,
      (newValue) => {
        if (newValue !== undefined) {
          updateSessionReplayState(newValue);
        }
      }
    );
  });
};
