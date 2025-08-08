import { computed } from "vue";
import { toValue } from "@vueuse/core/index";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import { useUserProperty } from "@/composables/useUserProperty";
import { useUserFlag } from "@/composables/useUserFlag";
import { useOnboardingFlag } from "@/composables/useOnboardingFlag";
import { useNewOnboardingFlag } from "@/composables/useNewOnboardingFlag";
import { useEncryptionGate } from "@/composables/useEncryptionGate";
import { isMobileDevice } from "@/scripts/regex";
import { useBasicMode } from "@/composables/useBasicMode";
import {
  DATA_DELETE_REQUESTED,
  HAS_EXITED_DELETE_FLOW,
  HAS_ONBOARDED_V4,
  HAS_SEEN_DD_POST_PAYMENT_ONBOARDING,
  HAS_SEEN_PLANS_MODAL,
  SHOW_DD_POST_PAYMENT_ONBOARDING,
} from "@/scripts/userFlags";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";

export const SCREEN = {
  APP: "SCREEN_APP",
  DOWNLOAD_MOBILE_APP: "SCREEN_DOWNLOAD_MOBILE_APP",
  DATA_DELETE_ENROLLMENT_OLD: "SCREEN_DATA_DELETE_ENROLLMENT_OLD",
  DATA_DELETE_ENROLLMENT: "SCREEN_DATA_DELETE_ENROLLMENT",
  NEW_ONBOARDING: "SCREEN_NEW_ONBOARDING",
  DEFAULT_ONBOARDING: "SCREEN_DEFAULT_ONBOARDING",
  WELCOME_MODAL: "SCREEN_WELCOME_MODAL",
};

const { isBasicModeEnabled, isBasicModeAccessible } = useBasicMode();

export const useScreen = () => {
  const store = useStore();
  const route = useRoute();
  const { width } = useWindowSize();
  const { isEncryptionAvailable } = useEncryptionGate();

  /* eslint-disable no-unused-vars */
  const [_0, hasLoadedUserProperties] = useUserProperty(null);
  const [_1, hasLoadedUserFlags] = useUserFlag(null);
  const [_2, hasLoadedOnboardingFlags] = useOnboardingFlag(null);
  const [_3, hasLoadedNewOnboardingFlags] = useNewOnboardingFlag(null);
  const { hasLoadedFeatureFlag: hasLoadedPostHogFlags } = usePostHogFeatureFlag(
    "identity-monitoring-enabled"
  );
  /* eslint-enable no-unused-vars */

  const isLoaded = computed(
    () =>
      toValue(hasLoadedUserProperties) &&
      toValue(hasLoadedUserFlags) &&
      toValue(hasLoadedOnboardingFlags) &&
      toValue(hasLoadedNewOnboardingFlags) &&
      toValue(hasLoadedPostHogFlags)
  );

  const [hasRequestedEnrollment] = useOnboardingFlag(DATA_DELETE_REQUESTED);
  const [hasExitedEnrollment] = useOnboardingFlag(HAS_EXITED_DELETE_FLOW);

  const [hasNewOnboarding] = useUserFlag(SHOW_DD_POST_PAYMENT_ONBOARDING);
  const [hasExitedNewOnboarding] = useNewOnboardingFlag(
    HAS_SEEN_DD_POST_PAYMENT_ONBOARDING
  );

  const [hasOnboarding] = useUserFlag("show_onboarding_v4");
  const [hasExitedOnboarding] = useOnboardingFlag(HAS_ONBOARDED_V4);

  const [hasSeenWelcomeModal] = useOnboardingFlag(HAS_SEEN_PLANS_MODAL);

  const { featureFlag: isIdentityMonitoringEnabled } = usePostHogFeatureFlag(
    "identity-monitoring-enabled"
  );

  const screen = computed(() => {
    if (!toValue(isLoaded)) {
      return SCREEN.APP;
    }

    if (toValue(hasRequestedEnrollment) && !toValue(hasExitedEnrollment)) {
      return toValue(isIdentityMonitoringEnabled) === true
        ? SCREEN.DATA_DELETE_ENROLLMENT
        : SCREEN.DATA_DELETE_ENROLLMENT_OLD;
    }

    if (
      toValue(hasNewOnboarding) &&
      !toValue(hasExitedNewOnboarding) &&
      (toValue(isBasicModeAccessible) ? !toValue(isBasicModeEnabled) : true) &&
      toValue(isEncryptionAvailable)
    ) {
      return SCREEN.NEW_ONBOARDING;
    }

    if (
      toValue(hasOnboarding) &&
      !toValue(hasNewOnboarding) &&
      !toValue(hasExitedOnboarding) &&
      !toValue(hasExitedNewOnboarding) &&
      !toValue(isBasicModeEnabled) &&
      toValue(isEncryptionAvailable)
    ) {
      return SCREEN.DEFAULT_ONBOARDING;
    }

    if (
      isMobileDevice &&
      width.value <= 760 &&
      route.path !== "/settings/subscription" &&
      !route.path.includes("/invitation/")
    ) {
      return SCREEN.DOWNLOAD_MOBILE_APP;
    }

    if (
      store.getters["settings/isTrial"] &&
      !toValue(hasSeenWelcomeModal) &&
      route.path !== "/settings/subscription" &&
      !route.path.includes("/invitation/")
    ) {
      return SCREEN.WELCOME_MODAL;
    }

    return SCREEN.APP;
  });

  return {
    screen,
    isLoaded,
  };
};
