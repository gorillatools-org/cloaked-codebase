import type { InjectionKey, ComputedRef, Ref } from "vue";

export type NetworkVisualizationFlag = {
  canShowNetwork: ComputedRef<boolean>;
  hasLoaded: Ref<boolean>;
  flag: Ref<string | null>;
};

export const networkVisualizationFlagKey: InjectionKey<NetworkVisualizationFlag> =
  Symbol("NetworkVisualizationFlag");
