import { computed } from "vue";
import { toValue } from "@vueuse/core/index";
import { useRoute } from "vue-router";
import { useUserProperty } from "@/composables/useUserProperty";
import { useUserFlag } from "@/composables/useUserFlag";
import { useOnboardingFlag } from "@/composables/useOnboardingFlag";
import { useCloakedPayUser } from "@/features/VirtualCards/composables/useCloakedPayUser.ts";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import {
  DATA_DELETE_REQUESTED,
  HAS_EXITED_DELETE_FLOW,
} from "@/scripts/userFlags";

export const SCREEN = {
  APP: "SCREEN_APP",
  DOWNLOAD_MOBILE_APP: "SCREEN_DOWNLOAD_MOBILE_APP",
};

/**
 * Screen detection composable with clearer logic and better separation of concerns
 * Includes centralized flag loading and screen determination logic
 */
export const useScreen = () => {
  const route = useRoute();
  // Load all flag states
  const [, hasLoadedUserProperties] = useUserProperty(null);
  const [, hasLoadedUserFlags] = useUserFlag(null);
  const [, hasLoadedOnboardingFlags] = useOnboardingFlag(null);

  const { hasLoadedFeatureFlag: hasLoadedPostHogFlags } = usePostHogFeatureFlag(
    "identity-monitoring-enabled"
  );

  const { isPayFlowPending } = useCloakedPayUser();

  // Check if all flags have loaded
  const areAllFlagsLoaded = computed(
    () =>
      toValue(hasLoadedUserProperties) &&
      toValue(hasLoadedUserFlags) &&
      toValue(hasLoadedOnboardingFlags) &&
      toValue(hasLoadedPostHogFlags)
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
   * Detect if user is on mobile device with robust browser-guarded checks
   * Uses modern userAgentData API when available, falls back to legacy methods
   */
  const isMobileDevice = computed(() => {
    // Guard for non-browser contexts
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return false;
    }

    // Method 1: Modern userAgentData API (preferred when available)
    if (navigator.userAgentData?.mobile !== undefined) {
      return navigator.userAgentData.mobile;
    }

    // Method 2: Legacy user agent regex detection
    const userAgent = navigator.userAgent;
    const isLegacyMobileDevice =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );

    // Method 3: iPadOS heuristic - Macintosh UA with touch support
    const isMacintoshWithTouch =
      /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 0;

    return isLegacyMobileDevice || isMacintoshWithTouch;
  });

  /**
   * Check if we should show the mobile app download screen
   */
  const shouldShowMobileAppDownload = computed(() => {
    const isMobile = toValue(isMobileDevice);
    const isNotSubscriptionPage = route.path !== "/settings/subscription";
    const isNotInvitationPage = !route.path.includes("/invitation/");
    const isNotExposureStatus = !route.path.includes("/exposure-status");
    const isNotExposuresEnroll = !route.path.includes("/exposures-enroll");

    return (
      isMobile &&
      isNotSubscriptionPage &&
      isNotInvitationPage &&
      isNotExposureStatus &&
      isNotExposuresEnroll
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

    if (route.path.startsWith("/virtual-cards") && isMobileDevice.value) {
      return isPayFlowPending.value ? SCREEN.APP : SCREEN.DOWNLOAD_MOBILE_APP;
    }

    // @Andrej: Add route validations here, otherwise we will not see other modals
    if (
      toValue(hasRequestedDataDeleteEnrollment) &&
      !toValue(hasExitedDataDeleteEnrollment)
    ) {
      return SCREEN.APP;
    }

    if (toValue(shouldShowMobileAppDownload)) {
      return SCREEN.DOWNLOAD_MOBILE_APP;
    }

    // Default: Show main app
    return SCREEN.APP;
  });

  return {
    screen,
    isMobileDevice,
    isLoaded: areAllFlagsLoaded,
    // Expose screen checks for debugging
    shouldShowDataDeleteEnrollment,
    shouldShowMobileAppDownload,
    // Expose additional flag states for potential future use
    hasRequestedDataDeleteEnrollment,
    hasExitedDataDeleteEnrollment,
  };
};
