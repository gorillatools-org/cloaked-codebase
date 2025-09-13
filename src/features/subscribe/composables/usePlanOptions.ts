import { computed, type MaybeRefOrGetter, ref, watch } from "vue";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { toValue } from "@vueuse/core";
import {
  type PlanBilling,
  type Plan,
  type PlanOption,
} from "@/features/subscribe/types.ts";

const selectedPlanOptionId = ref<Plan["product_id"] | null>(null);

type Options = {
  selectedBillingCycle: MaybeRefOrGetter<PlanBilling>;
};

export const usePlanOptions = ({ selectedBillingCycle }: Options) => {
  const { allPlans } = usePlans();

  const allOptions = computed<PlanOption[]>(() =>
    allPlans.value
      .filter((plan) => plan.provider === "stripe")
      .map((plan) => {
        const paypalPlan =
          allPlans.value.find(
            (paypalPlan) =>
              paypalPlan.provider === "paypal" &&
              paypalPlan.max_members === plan.max_members &&
              paypalPlan.recurring_interval === plan.recurring_interval
          ) ?? null;

        return {
          id: plan.product_id,
          stripePlan: plan,
          paypalPlan,
        };
      })
  );

  const selectedPlanOption = computed(
    () =>
      allOptions.value.find(
        (option) => option.id === selectedPlanOptionId.value
      ) ?? null
  );
  const selectedPlan = computed(
    () => selectedPlanOption.value?.stripePlan ?? null
  );
  const selectedPaypalPlan = computed(
    () => selectedPlanOption.value?.paypalPlan ?? null
  );

  watch(
    () => allOptions.value,
    (newValue) => {
      if (newValue && !selectedPlanOptionId.value) {
        selectedPlanOptionId.value =
          newValue?.find(
            (option) =>
              option?.stripePlan?.recurring_interval ===
                toValue(selectedBillingCycle) &&
              option?.stripePlan?.max_members === 1
          )?.id ?? null;
      }
    },
    { immediate: true }
  );

  const billingCycleOptions = computed(() =>
    allOptions.value.filter(
      (option) =>
        option.stripePlan?.recurring_interval === toValue(selectedBillingCycle)
    )
  );

  watch(
    () => toValue(selectedBillingCycle),
    (newBillingCycle) => {
      const newOption = allOptions.value.find(
        (option) =>
          option.stripePlan?.max_members ===
            selectedPlanOption.value?.stripePlan?.max_members &&
          option.stripePlan?.recurring_interval === newBillingCycle
      );

      if (newOption) {
        selectedPlanOptionId.value = newOption.id;
      }
    }
  );

  return {
    selectedPlanOptionId,
    selectedPlanOption,
    billingCycleOptions,
    selectedPlan,
    selectedPaypalPlan,
  };
};
