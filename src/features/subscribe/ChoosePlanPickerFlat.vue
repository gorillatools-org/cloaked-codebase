<script setup lang="ts">
import { computed } from "vue";
import ChoosePlanPicker from "@/features/subscribe/ChoosePlanPicker.vue";
import ChoosePlanOptionFlat from "@/features/subscribe/ChoosePlanOptionFlat.vue";
import ChoosePlanOptionSkeletonFlat from "@/features/subscribe/ChoosePlanOptionSkeletonFlat.vue";
import ChoosePlanGuarantee from "@/features/subscribe/ChoosePlanGuarantee.vue";
import BaseText from "@/library/BaseText.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_CHECKOUT_NEW_BASELINE } from "@/scripts/posthogEvents";

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
    v-bind="$attrs"
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
