import { useStore } from "vuex";
import { computed } from "vue";

export const useUserFlag = (flagName) => {
  const store = useStore();

  const hasLoaded = computed(() => !!store.state?.authentication?.user?.flags);

  const flag = computed(
    () => store.state?.authentication?.user?.flags?.[flagName] ?? null
  );

  return [flag, hasLoaded];
};
