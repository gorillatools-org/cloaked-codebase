import { computed, toValue } from "vue";
import { useInterval } from "@vueuse/core";

export const useCountdownDiscount = ({
  discountSize = 20,
  expiresIn = 5 * 60,
  // expiresIn = 20,
} = {}) => {
  const { counter, resume, pause, isActive } = useInterval(1000, {
    controls: true,
    immediate: false,
    callback: () => {
      if (countdown.value <= 0) {
        pause();
      }
    },
  });

  const countdown = computed(() => expiresIn - counter.value);

  const discount = computed(() =>
    isActive.value ? toValue(discountSize) : null
  );

  return {
    countdown,
    discount,
    start: resume,
  };
};
