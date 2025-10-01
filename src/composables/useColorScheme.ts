import { useLocalStorage, usePreferredColorScheme } from "@vueuse/core";
import { computed, toValue } from "vue";

export type AppScheme = "light" | "dark";

const isAppScheme = (value: unknown): value is AppScheme =>
  value === "light" || value === "dark";

const systemScheme = usePreferredColorScheme();
const appScheme = useLocalStorage<AppScheme | null>("color-scheme", null);

export const useColorScheme = () => {
  const colorScheme = computed<AppScheme>(() => {
    const appSchemeValue = toValue(appScheme);
    const systemSchemeValue = toValue(systemScheme);

    if (isAppScheme(appSchemeValue)) {
      return appSchemeValue;
    }

    if (isAppScheme(systemSchemeValue)) {
      return systemSchemeValue;
    }

    return "light";
  });

  const setColorScheme = (scheme: AppScheme | null) =>
    (appScheme.value = scheme);

  return {
    colorScheme,
    setColorScheme,
  };
};
