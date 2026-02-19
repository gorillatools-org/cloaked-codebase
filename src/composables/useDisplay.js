import { toValue, useWindowSize } from "@vueuse/core";
import { computed } from "vue";

const { width } = useWindowSize();

export const useDisplay = () => {
  const isMobile = computed(() => {
    return toValue(width) < 760;
  });

  const isTablet = computed(() => {
    return toValue(width) >= 760 && toValue(width) < 1050;
  });

  const isDesktop = computed(() => {
    return toValue(width) >= 1050;
  });

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
};
