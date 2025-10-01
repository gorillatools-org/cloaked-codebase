import { computed, type MaybeRefOrGetter, ref, watch } from "vue";
import { usePlans } from "@/features/subscribe/composables/usePlans";
import { toValue } from "@vueuse/core";
import {
  type PlanBilling,
  type Plan,
  type PlanOption,
  type PlanProduct,
} from "@/features/subscribe/types.ts";

const selectedPlanOptionId = ref<Plan["product_id"] | null>(null);

type Options = {
  selectedBillingCycle: MaybeRefOrGetter<PlanBilling>;
  planProduct: MaybeRefOrGetter<PlanProduct>;
};

export const usePlanOptions = ({
  selectedBillingCycle,
  planProduct = "all",
}: Options) => {
  const { allPlans } = usePlans(planProduct);

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

  const billingCycleOptions = computed(() =>
    allOptions.value.filter(
      (option) =>
        option.stripePlan?.recurring_interval === toValue(selectedBillingCycle)
    )
  );

  // If the options or billing cycle changes, update the selected plan option id to the same max members and billing cycle in the new options
  watch(
    [() => allOptions.value, () => toValue(selectedBillingCycle)],
    ([options, billingCycle]) => {
      if (options && billingCycle) {
        // Store the current selection details before updating to avoid circular dependency
        const currentSelection = selectedPlanOptionId.value;
        const currentOption = allOptions.value.find(
          (option) => option.id === currentSelection
        );
        const currentMaxMembers = currentOption?.stripePlan?.max_members || 1;

        // Find a matching option with the same max_members and new billing cycle
        const matchingOption = allOptions.value.find(
          (option) =>
            option?.stripePlan?.recurring_interval === billingCycle &&
            option?.stripePlan?.max_members === currentMaxMembers
        );

        // Only update if we found a match, otherwise preserve current selection
        if (matchingOption) {
          selectedPlanOptionId.value = matchingOption.id;
        } else if (!currentSelection) {
          // Only set to null if there was no previous selection
          selectedPlanOptionId.value = null;
        }
        // If no match found but there was a previous selection, keep the current selection
      }
    },
    { immediate: true }
  );

  return {
    selectedPlanOptionId,
    selectedPlanOption,
    billingCycleOptions,
    selectedPlan,
    selectedPaypalPlan,
  };
};
