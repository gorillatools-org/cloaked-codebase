import { ref } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";

const isMonitoringModalOpen = ref(false);

export const useMonitoringModal = () => {
  const openMonitoringModal = () => {
    isMonitoringModalOpen.value = true;
    posthogCapture("user_viewed_activate_identity_monitoring_modal");
  };

  return {
    isMonitoringModalOpen,
    openMonitoringModal,
  };
};
