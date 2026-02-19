import { useStore } from "vuex";
import { computed } from "vue";

export const useUserProperty = (propertyName) => {
  const store = useStore();

  const hasLoaded = computed(() => !!store.state?.authentication?.user);

  const property = computed(
    () => store.state?.authentication?.user?.[propertyName] ?? null
  );

  return [property, hasLoaded];
};
