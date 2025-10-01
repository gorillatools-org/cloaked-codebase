import { computed } from "vue";
import store from "@/store";
import { PH_FEATURE_FLAG_AUTO_CLOAKING } from "@/scripts/posthogEvents";

export const useFeatures = () => {
  const hasForYou = computed(() => {
    return (
      import.meta.env.VITE_APP_ENV !== "production" &&
      store.state.authentication?.user?.flags?.feature_discover_tab
    );
  });

  const hasExposureStatus = computed(() => {
    return store.state.authentication?.user?.flags?.feature_exposure_status;
  });

  const hasDataDeleteScan = computed(() => {
    return !!store.getters["dataDelete/enrollmentData"]?.enrollmentDataFetched;
  });

  const hasIdentityMonitoring = computed(() => {
    return true;
  });

  const hasPayEnabled = computed(() => {
    return (
      store.state.authentication?.user?.cloaked_card_enabled ||
      store.state.authentication?.user?.cloaked_card_enabled_status ===
        "enabled"
    );
  });

  const hasAutoPasswordChange = computed(() => {
    return store.state.authentication?.user?.flags?.[
      PH_FEATURE_FLAG_AUTO_CLOAKING
    ];
  });

  const hasVpnEnabled = computed(() => {
    return store.state.authentication?.user?.flags?.has_vpn_enabled;
  });

  return {
    hasForYou,
    hasDataDeleteScan,
    hasIdentityMonitoring,
    hasPayEnabled,
    hasAutoPasswordChange,
    hasExposureStatus,
    hasVpnEnabled,
  };
};
