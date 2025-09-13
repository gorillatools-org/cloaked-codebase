import { watch } from "vue";
import { SCREEN } from "@/composables/useScreen";
import { useRoute, useRouter } from "vue-router";

const SCREEN_ROUTES = {
  [SCREEN.APP]: null,
  [SCREEN.DOWNLOAD_MOBILE_APP]: null,
  [SCREEN.DATA_DELETE_ENROLLMENT]: "Enrollment",
};

export const useScreenRouting = (screen) => {
  const router = useRouter();
  const route = useRoute();

  const navigateToScreen = () => {
    const targetRoute = SCREEN_ROUTES[screen.value];

    if (!targetRoute || route.name?.startsWith(targetRoute)) {
      return;
    }

    if (route.name === targetRoute || route.name?.startsWith(targetRoute)) {
      return;
    }

    router.push({ name: targetRoute });
  };

  watch(screen, navigateToScreen, { immediate: true });
  watch(route, navigateToScreen, { immediate: true });
};
