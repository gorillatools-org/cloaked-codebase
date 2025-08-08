import { watch } from "vue";
import { SCREEN } from "@/composables/useScreen";
import { useRoute, useRouter } from "vue-router";

const SCREEN_TO_ROUTE = {
  [SCREEN.APP]: null,
  [SCREEN.DOWNLOAD_MOBILE_APP]: null,
  [SCREEN.DATA_DELETE_ENROLLMENT_OLD]: "DeleteFlow",
  [SCREEN.DATA_DELETE_ENROLLMENT]: "Enrollment",
  [SCREEN.NEW_ONBOARDING]: "NewOnboardingWelcome",
  [SCREEN.DEFAULT_ONBOARDING]: "OnboardingUser",
  [SCREEN.WELCOME_MODAL]: null,
};

export const useScreenRouting = (screen) => {
  const router = useRouter();
  const route = useRoute();

  const routeScreen = () => {
    const expectedRoute = SCREEN_TO_ROUTE[screen.value];

    if (!expectedRoute || route.name.startsWith(expectedRoute)) {
      return;
    }

    route.name === expectedRoute || router.push({ name: expectedRoute });
  };

  watch(screen, routeScreen, { immediate: true });
  watch(route, routeScreen, { immediate: true });
};
