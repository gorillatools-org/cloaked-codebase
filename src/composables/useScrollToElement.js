import { watch } from "vue";

export const useScrollToElement = (elementRef, scrollParams) => {
  watch(
    () => elementRef.value,
    (newValue) => newValue && newValue.scrollIntoView(scrollParams)
  );
};
