import { computed, toValue, type MaybeRefOrGetter } from "vue";

export type PlansExperimentType = "discounted-annual-plans";

export const usePlansExperiment = (headlessUser: MaybeRefOrGetter<any>) => {
  const experimentType = computed(() => {
    const experiment = toValue(headlessUser)?.flags?.monthly_plan_experiment;
    if (!experiment) return null;

    return experiment as PlansExperimentType;
  });

  return {
    experimentType,
  };
};
