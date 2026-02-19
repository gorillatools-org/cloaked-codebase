import { ref } from "vue";

export const useFunnel = (startingStep) => {
  const step = ref(startingStep);

  const setStep = (newStep) => {
    step.value = newStep;
    window.scrollTo({ top: 0 });
  };

  return {
    step,
    setStep,
  };
};
