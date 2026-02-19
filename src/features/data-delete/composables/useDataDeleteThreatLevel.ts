import { computed, type MaybeRef, unref } from "vue";
import type { DataDeleteSearchResult } from "@/types/data-delete-search";

type ThreatLevel = "high" | "medium" | "low" | "unknown";

export function useDataDeleteThreatLevel(
  searchResult: MaybeRef<DataDeleteSearchResult>
) {
  const threatLevelToProgress = {
    unknown: 1,
    high: 0.9,
    medium: 0.6,
    low: 0.3,
  };

  const result = computed(() => unref(searchResult) || {});

  const hasHighRisk = computed(
    () =>
      !!(
        result.value.ssn ||
        result.value.DOB ||
        result.value.locations?.length ||
        result.value.driversLicenses?.length
      )
  );

  const hasMediumRisk = computed(
    () => !!(result.value.gender || result.value.relatives?.length)
  );

  const hasLowRisk = computed(
    () => !!(result.value.phones?.length || result.value.emails?.length)
  );

  const threatLevel = computed<ThreatLevel>(() => {
    if (hasHighRisk.value) return "high";
    if (hasMediumRisk.value) return "medium";
    if (hasLowRisk.value) return "low";

    return "unknown";
  });

  const threatPercentage = computed(() =>
    Math.round(threatLevelToProgress[threatLevel.value] * 100)
  );

  return {
    threatLevel,
    threatPercentage,
    hasHighRisk,
    hasMediumRisk,
    hasLowRisk,
  };
}
