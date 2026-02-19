import { computed } from "vue";
import store from "@/store";

export const useCloakedAddressFeatureFlag = () => {
  const cloakedAddressEnabled = computed(() => {
    return !!store.state.authentication?.user?.flags?.cloaked_addresses_enabled;
  });

  return {
    cloakedAddressEnabled,
  };
};
