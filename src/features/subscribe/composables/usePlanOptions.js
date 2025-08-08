import { computed, ref, watch } from "vue";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { toValue } from "@vueuse/core/index";

const selectedPlanOptionId = ref(null);

export const usePlanOptions = ({ selectedBillingCycle }) => {
  const { allPlans } = usePlans();

  const allOptions = computed(() =>
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

  const selectedPlanOption = computed(() =>
    allOptions.value.find((option) => option.id === selectedPlanOptionId.value)
  );
  const selectedPlan = computed(() => selectedPlanOption.value?.stripePlan);
  const selectedPaypalPlan = computed(
    () => selectedPlanOption.value?.paypalPlan
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
    () => selectedBillingCycle.value,
    (newBillingCycle) => {
      const newOption = allOptions.value.find(
        (option) =>
          option.stripePlan?.max_members ===
            selectedPlanOption.value?.stripePlan?.max_members &&
          option.stripePlan?.recurring_interval === newBillingCycle
      );

      if (newOption?.isActive) {
        selectedPlanOptionId.value = allOptions.value.find(
          (option) => option.stripePlan?.recurring_interval === newBillingCycle
        )?.id;

        return;
      }

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
