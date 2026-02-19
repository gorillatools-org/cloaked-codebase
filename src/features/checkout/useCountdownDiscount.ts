import { computed, ref } from "vue";
import { useInterval } from "@vueuse/core";

export const useCountdownDiscount = ({
  discountSize = 20,
  expiresIn = 5 * 60,
} = {}) => {
  const discount = ref<number | null>(discountSize);
  const expirationTime = ref(expiresIn);

  const { counter, resume, pause, isActive } = useInterval(1000, {
    controls: true,
    immediate: false,
    callback: () => {
      if (countdown.value <= 0) {
        discount.value = null;
        pause();
      }
    },
  });

  const countdown = computed(() => expirationTime.value - counter.value);

  const updateDiscount = (newDiscount: number) => {
    if (countdown.value <= 0) {
      return;
    }

    discount.value = newDiscount;
  };

  const updateExpirationTime = (value: number) => {
    expirationTime.value = value;
    counter.value = 0;
  };

  return {
    countdown,
    discount,
    updateDiscount,
    updateExpirationTime,
    resume,
    pause,
    isActive,
  };
};
