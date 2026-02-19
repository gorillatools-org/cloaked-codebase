import { computed, markRaw, watch } from "vue";
import store from "@/store";
import { HAS_ACTIVATED_PLUGIN } from "@/scripts/userFlags";
import extensionMessaging from "@/scripts/messaging";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import { PH_FEATURE_FLAG_AI_OPERATOR } from "@/scripts/posthogEvents";
import AutoCloakingDataRemovalModal from "@/routes/DataDeletion/components/AutoCloakingDataRemoval/AutoCloakingDataRemovalModal.vue";
import { initializeExtensionMessaging } from "@/scripts/messaging";

export const useDataDeleteOperator = () => {
  const { featureFlag: operatorEnabled } = usePostHogFeatureFlag(
    PH_FEATURE_FLAG_AI_OPERATOR
  );

  const operatorDashboardLink = computed(() => {
    return store.getters["browser/operatorDashboardLink"];
  });

  const extensionInstalled = computed(() => {
    return (
      store.getters.getFlag(HAS_ACTIVATED_PLUGIN) &&
      store.getters["browser/pluginDetected"]
    );
  });

  watch(operatorEnabled, (enabled) => {
    if (enabled && !operatorDashboardLink.value) {
      try {
        requestOperatorDashboardLink();
      } catch (error) {
        console.error("Error requesting operator dashboard link", error);
      }
    }
  });

  const requestOperatorDashboardLink = () => {
    try {
      if (operatorEnabled.value) {
        initializeExtensionMessaging().then(() => {
          extensionMessaging?.sendMessage?.({
            type: "OPERATOR_DASHBOARD_LINK_REQUEST",
          });
        });
      }
    } catch (error) {
      console.error("Error requesting operator dashboard link", error);
    }
  };

  const openExtension = () => {
    window.open(operatorDashboardLink.value, "_blank");
  };

  const extensionOutdated = computed(() => {
    return extensionInstalled.value && !operatorDashboardLink.value;
  });

  const canProceedToOperator = computed(() => {
    return (
      operatorEnabled.value &&
      extensionInstalled.value &&
      !extensionOutdated.value
    );
  });

  const openOperatorModal = (
    brokerFamily,
    onViewManualRemovalSteps = () => {}
  ) => {
    if (operatorEnabled.value === true) {
      store.dispatch("openModal", {
        customTemplate: {
          template: markRaw(AutoCloakingDataRemovalModal),
          props: {
            brokerFamily: brokerFamily,
          },
          events: {
            onViewManualRemovalSteps: onViewManualRemovalSteps,
          },
        },
      });
    } else {
      console.warn("Attempting to open operator modal when it's not enabled");
    }
  };

  return {
    operatorEnabled,
    operatorDashboardLink,
    extensionInstalled,
    openExtension,
    requestOperatorDashboardLink,
    canProceedToOperator,
    extensionOutdated,
    openOperatorModal,
  };
};
