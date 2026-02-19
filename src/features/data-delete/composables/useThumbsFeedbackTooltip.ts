import { ref, computed } from "vue";

const activeTooltipId = ref<string | null>(null);

export function useThumbsFeedbackTooltip(componentId: string) {
  const requestTooltip = () => {
    if (activeTooltipId.value === null) {
      activeTooltipId.value = componentId;
    }
  };

  const hideTooltip = () => {
    if (activeTooltipId.value === componentId) {
      activeTooltipId.value = null;
    }
  };

  const canShowTooltip = computed(() => activeTooltipId.value === componentId);

  return {
    requestTooltip,
    hideTooltip,
    canShowTooltip,
  };
}
