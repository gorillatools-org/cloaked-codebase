import { useStore } from "vuex";
import { computed } from "vue";

export const useOnboardingFlag = (flagName) => {
  const store = useStore();

  const hasLoaded = computed(() => !!store.state?.flags?.onboarding);

  const flag = computed(
    () => store.state?.flags?.onboarding?.[flagName] ?? null
  );

  return [flag, hasLoaded];
};
