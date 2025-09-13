import { computed } from "vue";
import { toValue } from "@vueuse/core/index";
import { useRoute } from "vue-router";
import { useWindowSize } from "@vueuse/core";
import { useDisplay } from "@/composables/useDisplay";
import { useUserProperty } from "@/composables/useUserProperty";
import { useUserFlag } from "@/composables/useUserFlag";
import { useOnboardingFlag } from "@/composables/useOnboardingFlag";

import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import {
  DATA_DELETE_REQUESTED,
  HAS_EXITED_DELETE_FLOW,
} from "@/scripts/userFlags";

export const SCREEN = {
  APP: "SCREEN_APP",
  DOWNLOAD_MOBILE_APP: "SCREEN_DOWNLOAD_MOBILE_APP",
  DATA_DELETE_ENROLLMENT: "SCREEN_DATA_DELETE_ENROLLMENT",
};

/**
 * Screen detection composable with clearer logic and better separation of concerns
 * Includes centralized flag loading and screen determination logic
 */
export const useScreen = () => {
  const route = useRoute();
  const { width } = useWindowSize();
  const { isMobile } = useDisplay();
  // Load all flag states
  const [, hasLoadedUserProperties] = useUserProperty(null);
  const [, hasLoadedUserFlags] = useUserFlag(null);
  const [, hasLoadedOnboardingFlags] = useOnboardingFlag(null);

  const { hasLoadedFeatureFlag: hasLoadedPostHogFlags } = usePostHogFeatureFlag(
    "identity-monitoring-enabled"
  );
  const {
    hasLoadedFeatureFlag: hasLoadedEnrollmentV2Flag,
    featureFlag: enrollmentV2Enabled,
  } = usePostHogFeatureFlag("enrollment_v2_enabled");

  // Check if all flags have loaded
  const areAllFlagsLoaded = computed(
    () =>
      toValue(hasLoadedUserProperties) &&
      toValue(hasLoadedUserFlags) &&
      toValue(hasLoadedOnboardingFlags) &&
      toValue(hasLoadedPostHogFlags) &&
      toValue(hasLoadedEnrollmentV2Flag)
  );

  // Data Delete Enrollment flags
  const [hasRequestedDataDeleteEnrollment] = useOnboardingFlag(
    DATA_DELETE_REQUESTED
  );
  const [hasExitedDataDeleteEnrollment] = useOnboardingFlag(
    HAS_EXITED_DELETE_FLOW
  );

  // Computed flag states
  const shouldShowDataDeleteEnrollment = computed(
    () =>
      toValue(hasRequestedDataDeleteEnrollment) &&
      !toValue(hasExitedDataDeleteEnrollment)
  );

  /**
   * Check if we should show the mobile app download screen
   */
  const shouldShowMobileAppDownload = computed(() => {
    const isMobileDevice = toValue(isMobile);
    const isNarrowScreen = toValue(width) <= 760;
    const isNotSubscriptionPage = route.path !== "/settings/subscription";
    const isNotInvitationPage = !route.path.includes("/invitation/");

    return (
      isMobileDevice &&
      isNarrowScreen &&
      isNotSubscriptionPage &&
      isNotInvitationPage
    );
  });

  /**
   * Determine which screen to show based on priority order
   */
  const screen = computed(() => {
    if (!toValue(areAllFlagsLoaded)) {
      return SCREEN.APP;
    }

    if (route.path.includes("mobile")) {
      return SCREEN.APP;
    }

    if (
      toValue(hasRequestedDataDeleteEnrollment) &&
      !toValue(hasExitedDataDeleteEnrollment)
    ) {
      if (toValue(enrollmentV2Enabled)) {
        return SCREEN.APP;
      }
      return SCREEN.DATA_DELETE_ENROLLMENT;
    }

    if (toValue(shouldShowMobileAppDownload)) {
      return SCREEN.DOWNLOAD_MOBILE_APP;
    }

    // Default: Show main app
    return SCREEN.APP;
  });

  return {
    screen,
    isLoaded: areAllFlagsLoaded,
    // Expose screen checks for debugging
    shouldShowDataDeleteEnrollment,
    shouldShowMobileAppDownload,
    // Expose additional flag states for potential future use
    hasRequestedDataDeleteEnrollment,
    hasExitedDataDeleteEnrollment,
  };
};
