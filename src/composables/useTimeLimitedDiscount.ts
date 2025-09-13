import { computed, toValue, watch } from "vue";
import { useInterval } from "@vueuse/core";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { usePostHogFeatureFlag } from "./usePostHogFeatureFlag.js";

export const useTimeLimitedDiscount = ({
  discountSize = 20,
  expiresIn = 5 * 60,
} = {}) => {
  const { counter, resume, pause, isActive } = useInterval(1000, {
    controls: true,
    immediate: false,
    callback: () => {
      if (countdownTime.value <= 0) {
        pause();
      }
    },
  });

  const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
    "checkout-countdown-timer-4-22-25"
  );

  const featureFlagActive = computed(
    () => hasLoadedFeatureFlag.value && featureFlag.value !== "no-timer"
  );

  const countdownTime = computed(() => expiresIn - counter.value);

  const formattedTime = computed(() => {
    const minutes = Math.floor(countdownTime.value / 60);
    const remainingSeconds = countdownTime.value % 60;
    return `${minutes} minute${minutes !== 1 ? "s" : ""} and ${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}`;
  });

  const { isLoadingPlans } = usePlans();

  watch(
    [isLoadingPlans, hasLoadedFeatureFlag],
    ([loadingPlans, loadedFlag]) => {
      if (!loadingPlans && loadedFlag && featureFlagActive.value) {
        resume();
      }
    },
    { immediate: true }
  );

  const timeLimitedDiscount = computed(() =>
    isActive.value && featureFlagActive.value ? toValue(discountSize) : null
  );

  return {
    timeLimitedDiscount,
    countdownTime,
    formattedTime,
    featureFlagActive,
  };
};
