import { computed } from "vue";
import UserService from "@/api/actions/user-service";
import store from "@/store";
import router from "@/routes/router";

export const useBasicMode = () => {
  const hasDDScan = computed(() => {
    return !!store.getters["dataDelete/enrollmentData"]?.enrollmentDataFetched;
  });
  const toggleBasicMode = async () => {
    try {
      const newMode = !isBasicModeEnabled.value;
      await UserService.toggleBasicMode(newMode);
      await store.dispatch("authentication/getUser");
      if (newMode) {
        // newmode == basic mode
        router.push({ name: "SummaryBasicMode" });
      } else if (hasDDScan.value) {
        // newmode == advanced mode + user has dd
        router.push({ name: "NewOnboardingWelcome" });
      } else {
        // newmode == advanced mode + user does not have dd
        router.push({ name: "Home" });
      }
    } catch (error) {
      console.error("Error toggling advanced mode:", error);
    }
  };

  const isBasicModeEnabled = computed(
    () => !store.state.authentication?.user?.is_advanced_mode
  );
  const isBasicModeAccessible = computed(
    () => store.state.authentication?.user?.is_basic_mode_accessible
  );

  return {
    isBasicModeEnabled,
    isBasicModeAccessible,
    toggleBasicMode,
  };
};
