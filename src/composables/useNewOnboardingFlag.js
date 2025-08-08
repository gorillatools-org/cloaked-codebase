import { useStore } from "vuex";
import { computed } from "vue";

export const useNewOnboardingFlag = (flagName) => {
  const store = useStore();

  const hasLoaded = computed(() => !!store.state?.flags?.newOnboardingFlags);

  const flag = computed(
    () => store.state?.flags?.newOnboardingFlags?.[flagName] ?? null
  );

  return [flag, hasLoaded];
};
