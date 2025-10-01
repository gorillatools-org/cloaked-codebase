import { computed, ref } from "vue";
import { useTimestamp } from "@vueuse/core";
import { toValue } from "@vueuse/core/index";

export const useCoolDown = (time = 30 * 1000) => {
  const currentTimestamp = useTimestamp();
  const coolDownTimestamp = ref(0);

  const timeRemaining = computed(() =>
    Math.max(0, toValue(coolDownTimestamp) - toValue(currentTimestamp))
  );

  const start = () => {
    coolDownTimestamp.value = new Date().getTime() + time;
  };

  const isCoolingDown = computed(() => toValue(timeRemaining) > 0);

  return {
    isCoolingDown,
    timeRemaining,
    start,
  };
};
