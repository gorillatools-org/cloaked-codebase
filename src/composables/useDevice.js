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

  const updateDeviceState = () => {
    if (typeof window === "undefined") return;

    isMobile.value = width.value < MOBILE_BREAKPOINT;
    isTablet.value =
      width.value >= MOBILE_BREAKPOINT && width.value < TABLET_BREAKPOINT;
    isDesktop.value = width.value >= TABLET_BREAKPOINT;
  };

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
    MOBILE_BREAKPOINT,
    TABLET_BREAKPOINT,
  };
};
