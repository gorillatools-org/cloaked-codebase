import { onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { useColorScheme } from "@/composables/useColorScheme";

export const useThemeQueryParameter = (fallback = "dark") => {
  const route = useRoute();
  const { setColorScheme } = useColorScheme();

  onBeforeMount(() => {
    if (route.query.theme) {
      setColorScheme(route.query.theme);
    } else {
      setColorScheme(fallback);
    }
  });
};
