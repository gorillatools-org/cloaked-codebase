import { useLocalStorage, usePreferredColorScheme } from "@vueuse/core";
import { computed } from "vue";
import { toValue } from "@vueuse/core/index";

const systemScheme = usePreferredColorScheme();
const appScheme = useLocalStorage("color-scheme", null);

export const useColorScheme = () => {
  const colorScheme = computed(
    () => toValue(appScheme) ?? toValue(systemScheme)
  );

  const setColorScheme = (scheme) => (appScheme.value = scheme);

  return {
    colorScheme,
    setColorScheme,
  };
};
