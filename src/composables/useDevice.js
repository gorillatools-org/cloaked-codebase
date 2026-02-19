import { ref, onMounted, onUnmounted } from "vue";
import { useWindowSize } from "@vueuse/core";

export const useDevice = () => {
  const { width } = useWindowSize();

  // Screen size based detection
  const MOBILE_BREAKPOINT = 760;
  const TABLET_BREAKPOINT = 1050;

  const isMobile = ref(width.value < MOBILE_BREAKPOINT);
  const isTablet = ref(
    width.value >= MOBILE_BREAKPOINT && width.value < TABLET_BREAKPOINT
  );
  const isDesktop = ref(width.value >= TABLET_BREAKPOINT);
  const isIOS = ref(_isIOS());

  const updateDeviceState = () => {
    if (typeof window === "undefined") return;

    isMobile.value = width.value < MOBILE_BREAKPOINT;
    isTablet.value =
      width.value >= MOBILE_BREAKPOINT && width.value < TABLET_BREAKPOINT;
    isDesktop.value = width.value >= TABLET_BREAKPOINT;
    isIOS.value = _isIOS();
  };

  function _isIOS() {
    return (
      typeof window !== "undefined" &&
      (/iP(hone|ad|od)/.test(window.navigator.userAgent) ||
        (window.navigator.platform === "MacIntel" &&
          window.navigator.maxTouchPoints > 1))
    );
  }

  onMounted(() => {
    updateDeviceState();
    window.addEventListener("resize", updateDeviceState);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateDeviceState);
  });

  return {
    isMobile,
    isTablet,
    isDesktop,
    isIOS,
    MOBILE_BREAKPOINT,
    TABLET_BREAKPOINT,
  };
};
