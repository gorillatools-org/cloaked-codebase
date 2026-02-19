import { computed } from "vue";
import store from "@/store";
import { PH_FEATURE_FLAG_AUTO_CLOAKING } from "@/scripts/posthogEvents";

export const useFeatures = () => {
  const hasExposureStatus = computed(() => {
    return store.state.authentication?.user?.flags?.feature_exposure_status;
  });

  const hasDataDeleteScan = computed(() => {
    return !!store.getters["dataDelete/enrollmentData"]?.enrollmentDataFetched;
  });

  const hasIdentityMonitoring = computed(() => {
    return true;
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
    hasDataDeleteScan,
    hasIdentityMonitoring,
    hasAutoPasswordChange,
    hasExposureStatus,
    hasVpnEnabled,
  };
};
