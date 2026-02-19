import { ref, onBeforeUnmount, onMounted } from "vue";
import { useInterval } from "@vueuse/core";
import moment from "moment";

export type IdentitiesDeleteCounterType =
  | "identity-theft-reports"
  | "exposures-removed";

export const useIdentitiesCounter = (
  type: IdentitiesDeleteCounterType = "identity-theft-reports"
) => {
  // Constants from FTC Consumer Sentinel Data Book 2024 (used for identity-theft-reports type)
  const REPORTS_PER_YEAR = 1_135_291;
  const SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000
  const REPORTS_PER_SECOND = REPORTS_PER_YEAR / SECONDS_PER_YEAR; // ≈ 0.036

  // Used for exposures-removed type
  const INITIAL_EXPOSURES_REMOVED = 1_128_881_465;

  const counter = ref(0);
  const interval = ref<ReturnType<typeof setInterval> | undefined>(undefined);

  const { pause } = useInterval(
    type === "identity-theft-reports" ? 1500 : 3000,
    {
      controls: true,
      immediate: true,
      callback: () => {
        counter.value = updateCounter();
      },
    }
  );

  onMounted(() => {
    const initialValue = updateCounter();
    animateCounter(initialValue);
  });

  onBeforeUnmount(() => {
    pause();
    clearInterval(interval.value);
  });

  const animateCounter = (target: number) => {
    if (interval.value) {
      clearInterval(interval.value);
    }

    counter.value = 0;
    const duration = 1700;
    const steps = 5;
    const stepDuration = duration / steps;
    const step = target / steps;
    let current = 0;

    interval.value = setInterval(() => {
      current += step;
      if (current >= target) {
        counter.value = target;
        clearInterval(interval.value);
        interval.value = undefined;
      } else {
        counter.value = Math.floor(current);
      }
    }, stepDuration);
  };

  const updateCounter = () => {
    if (type === "exposures-removed") {
      if (counter.value === 0) {
        return INITIAL_EXPOSURES_REMOVED;
      }

      return counter.value + Math.floor(Math.random() * 50);
    }

    if (type === "identity-theft-reports") {
      const now = moment.utc();
      const startOfYear = now.clone().startOf("year");
      const secondsSinceStartOfYear = now.diff(startOfYear, "seconds");

      return Math.floor(REPORTS_PER_SECOND * secondsSinceStartOfYear);
    }

    return 0;
  };

  return {
    counter,
  };
};
