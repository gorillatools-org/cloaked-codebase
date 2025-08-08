import { computed } from "vue";
import store from "@/store";

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
    return store.state.authentication?.user?.flags?.identity_monitoring_enabled;
  });

  const hasPayEnabled = computed(() => {
    return store.state.authentication?.user?.cloaked_card_enabled;
  });

  const hasAutoPasswordChange = computed(() => {
    return store.state.authentication?.user?.flags
      ?.autocloaking_operator_enabled;
  });

  return {
    hasForYou,
    hasDataDeleteScan,
    hasIdentityMonitoring,
    hasPayEnabled,
    hasAutoPasswordChange,
    hasExposureStatus,
  };
};
