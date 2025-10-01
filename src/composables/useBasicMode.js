import { computed } from "vue";
import UserService from "@/api/actions/user-service";
import store from "@/store";

export const useBasicMode = () => {
  const isBasicModeEnabled = computed(
    () => !store.state.authentication?.user?.is_advanced_mode
  );

  const toggleBasicMode = async () => {
    const newMode = !isBasicModeEnabled.value;
    await UserService.toggleBasicMode(newMode);
    await store.dispatch("authentication/getUser");

    return {
      isBasicMode: newMode,
    };
  };

  return {
    isBasicModeEnabled,
    toggleBasicMode,
  };
};

export const useBasicModeRouting = () => {
  const { toggleBasicMode } = useBasicMode();

  const toggleBasicModeWithRouting = async (router) => {
    const result = await toggleBasicMode();

    if (result.isBasicMode) {
      router.push("/exposure-status");
    } else {
      router.push("/home");
    }
  };

  return {
    toggleBasicModeWithRouting,
  };
};
