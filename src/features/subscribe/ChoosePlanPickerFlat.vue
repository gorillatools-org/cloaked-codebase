<script setup lang="ts">
import { computed } from "vue";
import ChoosePlanPicker, {
  type ChoosePlanPickerProps,
} from "@/features/subscribe/ChoosePlanPicker.vue";
import ChoosePlanOptionFlat from "@/features/subscribe/ChoosePlanOptionFlat.vue";
import ChoosePlanOptionSkeletonFlat from "@/features/subscribe/ChoosePlanOptionSkeletonFlat.vue";
import ChoosePlanGuarantee from "@/features/subscribe/ChoosePlanGuarantee.vue";
import BaseText from "@/library/BaseText.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_CHECKOUT_NEW_BASELINE } from "@/scripts/posthogEvents";
import ChoosePlanIncludeCloakedPay from "@/features/subscribe/ChoosePlanIncludeCloakedPay.vue";
import type { PlanBilling } from "./types";

const props = defineProps<
  ChoosePlanPickerProps & {
    showCloakedPayPlansToggle: boolean;
  }
>();

const showCloakedPayPlans = defineModel<boolean>("showCloakedPayPlans", {
  default: false,
});
const billingCycle = defineModel<PlanBilling>("billingCycle", {
  default: "annually",
});

const {
  featureFlag: checkoutNewBaseLine,
  hasLoadedFeatureFlag: checkoutNewBaseLineLoaded,
} = usePostHogFeatureFlag(PH_FEATURE_FLAG_CHECKOUT_NEW_BASELINE);

const showGuaranteeBelowPlanPicker = computed(
  () =>
    checkoutNewBaseLineLoaded.value &&
    checkoutNewBaseLine.value !== "new-baseline"
);
</script>

<template>
  <ChoosePlanPicker
    v-model:billing-cycle="billingCycle"
    v-model:show-cloaked-pay-plans="showCloakedPayPlans"
    :plan-product="showCloakedPayPlans ? 'cloaked_pay' : 'all'"
    :anchor="props.anchor"
    :discount="props.discount"
    :disabled="props.disabled"
    class="choose-plan-picker-flat"
  >
    <template #label>
      <BaseText
        as="h2"
        variant="headline-3-bold"
      >
        Select plan
      </BaseText>
    </template>
    <template #skeleton="{ selectedBillingCycle }">
      <ChoosePlanOptionSkeletonFlat
        type="individual"
        :billing="selectedBillingCycle"
      />
      <ChoosePlanOptionSkeletonFlat
        type="couple"
        :billing="selectedBillingCycle"
      />
      <ChoosePlanOptionSkeletonFlat
        type="family"
        :billing="selectedBillingCycle"
      />
    </template>
    <template #option="slotProps">
      <ChoosePlanOptionFlat v-bind="slotProps" />
    </template>
    <template #after>
      <ChoosePlanIncludeCloakedPay
        v-if="props.showCloakedPayPlansToggle"
        v-model="showCloakedPayPlans"
        :billing-cycle="billingCycle"
        class="choose-plan-picker-flat__cloaked-pay"
      />
      <ChoosePlanGuarantee
        v-show="showGuaranteeBelowPlanPicker"
        class="choose-plan-picker-flat__guarantee"
      />
    </template>
  </ChoosePlanPicker>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.choose-plan-picker-flat {
  &__guarantee {
    margin-top: 24px;
  }

  &__cloaked-pay {
    margin-top: 16px;
  }

  :deep(.choose-plan-picker__billing-cycle) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  :deep(.choose-plan-picker__plans) {
    @media all and (max-width: $screen-lg) {
      padding-left: 8px;
      padding-right: 8px;
    }
  }
}
</style>
