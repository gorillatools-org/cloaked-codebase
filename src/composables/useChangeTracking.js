import { ref } from "vue";
import { toValue } from "@vueuse/core/index";

export const useChangeTracking = () => {
  let latestChangeId = ref(null);

  const trackChange = () => {
    latestChangeId.value = crypto.randomUUID();
    return toValue(latestChangeId);
  };

  return {
    latestChangeId,
    trackChange,
  };
};
